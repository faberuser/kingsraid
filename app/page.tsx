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

async function getFeaturedHeroes(): Promise<FeaturedHero[]> {
	try {
		// Updated path to match your actual structure
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

export default async function Home() {
	const featuredHeroes = await getFeaturedHeroes()

	return <HomeClient featuredHeroes={featuredHeroes} />
}
