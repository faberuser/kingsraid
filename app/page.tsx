import HomeClient from "@/app/client"
import fs from "fs"
import path from "path"
import { HeroData } from "@/model/Hero"

export interface FeaturedHero {
	name: string
	title: string
	class: string
	image: string
}

export interface NewsItem {
	title: string
	url: string
	date: string
	contents: string
}

async function getFeaturedHeroes(): Promise<FeaturedHero[]> {
	try {
		const heroesDir = path.join(process.cwd(), "public", "kingsraid-data", "table-data", "heroes")

		if (!fs.existsSync(heroesDir)) {
			return []
		}

		// Get all JSON files in the heroes directory
		const files = fs.readdirSync(heroesDir).filter((file) => file.endsWith(".json"))
		const featuredHeroes: FeaturedHero[] = []

		// Limit to 12 heroes
		for (const file of files) {
			const heroJsonPath = path.join(heroesDir, file)

			try {
				const heroData: HeroData = JSON.parse(fs.readFileSync(heroJsonPath, "utf-8"))

				// Get first costume image
				let costumeImage = ""

				// Get visual instead of basic if available
				if (heroData.visual) {
					costumeImage = `/kingsraid-data/assets/${heroData.visual}`
				} else if (heroData.costumes) {
					const costumePath = path.join(
						process.cwd(),
						"public",
						"kingsraid-data",
						"assets",
						heroData.costumes
					)

					if (fs.existsSync(costumePath)) {
						const costumeFiles = fs
							.readdirSync(costumePath)
							.filter((file) => file.toLowerCase().match(/\.(png|gif)$/))

						// Prioritize basic.png, otherwise get first sorted file
						const basicCostume = costumeFiles.find((file) => file.toLowerCase() === "basic.png")
						const selectedCostume = basicCostume || costumeFiles.sort()[0]

						if (selectedCostume) {
							costumeImage = `/kingsraid-data/assets/${heroData.costumes}/${selectedCostume}`
						}
					}
				}

				if (costumeImage) {
					featuredHeroes.push({
						name: heroData.infos.name,
						title: heroData.infos.title,
						class: heroData.infos.class,
						image: costumeImage,
					})
				}
			} catch (error) {
				console.error(error)
			}
		}

		// Shuffle for variety
		return featuredHeroes.sort(() => Math.random() - 0.5)
	} catch (error) {
		console.error(error)
		return []
	}
}

async function getSteamNews(): Promise<NewsItem[]> {
	try {
		const response = await fetch("https://store.steampowered.com/feeds/news/app/3689540/", {
			next: { revalidate: 3600 }, // Revalidate every hour
		})

		const text = await response.text()

		// Parse RSS XML
		const items: NewsItem[] = []
		const itemRegex = /<item>([\s\S]*?)<\/item>/g
		let match

		while ((match = itemRegex.exec(text)) !== null) {
			const itemContent = match[1]

			// Extract CDATA content more precisely
			const extractCDATA = (tag: string, content: string): string => {
				const cdataMatch = content.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "s"))
				if (cdataMatch) return cdataMatch[1].trim()

				const regularMatch = content.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "s"))
				return regularMatch ? regularMatch[1].trim() : ""
			}

			// Decode HTML entities on server side
			const decodeHtmlEntities = (str: string): string => {
				return str
					.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">")
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'")
					.replace(/&amp;/g, "&")
			}

			const title = extractCDATA("title", itemContent)
			const url = extractCDATA("link", itemContent)
			const date = extractCDATA("pubDate", itemContent)
			const contents = decodeHtmlEntities(extractCDATA("description", itemContent))

			items.push({
				title,
				url,
				date,
				contents,
			})
		}

		return items
	} catch (error) {
		console.error("Error fetching Steam news:", error)
		return []
	}
}

export default async function Home() {
	const featuredHeroes = await getFeaturedHeroes()
	const steamNews = await getSteamNews()

	return <HomeClient featuredHeroes={featuredHeroes} steamNews={steamNews} />
}
