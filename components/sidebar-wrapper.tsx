import fs from "fs"
import path from "path"
import { ArtifactData } from "@/model/Artifact"
import { BossData } from "@/model/Boss"
import ClientSidebar from "@/components/client-sidebar"

interface ArtifactsData {
	[artifactName: string]: ArtifactData
}

interface HeroData {
	name: string
	infos?: {
		class?: string
		title?: string
	}
}

async function getSearchData() {
	const searchData: {
		heroes: Array<{ name: string; infos?: { class?: string; title?: string } }>
		artifacts: Array<{ name: string; data?: { description?: string } }>
		bosses: Array<{ infos?: { class?: string; title?: string; race?: string } }>
	} = {
		heroes: [],
		artifacts: [],
		bosses: [],
	}

	try {
		// Load Heroes
		const heroesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "heroes")
		if (fs.existsSync(heroesDir)) {
			const heroFiles = fs.readdirSync(heroesDir).filter((file) => file.endsWith(".json"))

			for (const file of heroFiles) {
				try {
					const filePath = path.join(heroesDir, file)
					const fileContent = fs.readFileSync(filePath, "utf-8")
					const heroData: HeroData = JSON.parse(fileContent)

					searchData.heroes.push({
						name: heroData.name || path.basename(file, ".json"),
						infos: heroData.infos,
					})
				} catch (error) {
					console.error(`Error reading hero file ${file}:`, error)
				}
			}
		}

		// Load Artifacts
		const artifactsFile = path.join(process.cwd(), "kingsraid-data", "table-data", "artifacts.json")
		if (fs.existsSync(artifactsFile)) {
			const fileContent = fs.readFileSync(artifactsFile, "utf-8")
			const artifactsData: ArtifactsData = JSON.parse(fileContent)

			searchData.artifacts = Object.entries(artifactsData).map(([name, data]) => ({
				name,
				data: {
					description: data.description,
				},
			}))
		}

		// Load Bosses
		const bossesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "bosses")
		if (fs.existsSync(bossesDir)) {
			const bossFiles = fs.readdirSync(bossesDir).filter((file) => file.endsWith(".json"))

			for (const file of bossFiles) {
				try {
					const filePath = path.join(bossesDir, file)
					const fileContent = fs.readFileSync(filePath, "utf-8")
					const bossData: BossData = JSON.parse(fileContent)

					searchData.bosses.push({
						infos: {
							class: bossData.infos?.class,
							title: bossData.infos?.title || bossData.infos?.class,
							race: bossData.infos?.race,
						},
					})
				} catch (error) {
					console.error(`Error reading boss file ${file}:`, error)
				}
			}
		}
	} catch (error) {
		console.error("Error loading search data:", error)
	}

	return searchData
}

export default async function SidebarWrapper() {
	const searchData = await getSearchData()
	return <ClientSidebar searchData={searchData} />
}
