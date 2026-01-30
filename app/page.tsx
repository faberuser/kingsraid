import fs from "fs"
import path from "path"
import HomeClient from "@/app/client"
import { HeroData } from "@/model/Hero"
import { getSteamNews } from "@/lib/steam-rss"

export interface FeaturedHero {
	name: string
	title: string
	class: string
	image: string
}

async function getFeaturedHeroes(): Promise<FeaturedHero[]> {
	try {
		// Use cbt data for featured heroes (has the most recent hero roster)
		const heroesDir = path.join(process.cwd(), "public", "kingsraid-data", "table-data", "cbt", "heroes")

		if (!fs.existsSync(heroesDir)) {
			return []
		}

		// Get all JSON files in the heroes directory
		// Shuffle for variety
		const files = fs
			.readdirSync(heroesDir)
			.filter((file) => file.endsWith(".json"))
			.sort(() => Math.random() - 0.5)
		const featuredHeroes: FeaturedHero[] = []

		// Limit to 12 heroes
		for (const file of files.slice(0, 12)) {
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
						heroData.costumes,
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

				// Fallback: try to find visual.png directly in the hero's assets folder
				if (!costumeImage && heroData.profile?.name) {
					const visualPath = path.join(
						process.cwd(),
						"public",
						"kingsraid-data",
						"assets",
						"heroes",
						heroData.profile.name,
						"visual.png",
					)
					if (fs.existsSync(visualPath)) {
						costumeImage = `/kingsraid-data/assets/heroes/${heroData.profile.name}/visual.png`
					}
				}

				if (costumeImage) {
					featuredHeroes.push({
						name: heroData.profile.name,
						title: heroData.profile.title,
						class: heroData.profile.class,
						image: costumeImage,
					})
				}
			} catch (error) {
				console.error(error)
			}
		}

		return featuredHeroes
	} catch (error) {
		console.error(error)
		return []
	}
}

export default async function Home() {
	const featuredHeroes = await getFeaturedHeroes()
	const steamNews = await getSteamNews(6) // Limit to 6 news items

	return <HomeClient featuredHeroes={featuredHeroes} steamNews={steamNews} />
}
