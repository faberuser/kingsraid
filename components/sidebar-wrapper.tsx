import fs from "fs"
import path from "path"
import ClientSidebar from "@/components/client-sidebar"
import { ArtifactData } from "@/model/Artifact"
import { HeroData } from "@/model/Hero"
import { BossData } from "@/model/Boss"

async function getSearchData() {
	const searchData: {
		heroes: HeroData[]
		artifacts: ArtifactData[]
		bosses: BossData[]
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
						...heroData,
						name: heroData.name || path.basename(file, ".json"),
					})
				} catch (error) {
					console.error(error)
				}
			}
		}

		// Load Artifacts
		const artifactsFile = path.join(process.cwd(), "kingsraid-data", "table-data", "artifacts.json")
		if (fs.existsSync(artifactsFile)) {
			const fileContent = fs.readFileSync(artifactsFile, "utf-8")
			const artifactsData: ArtifactData[] = JSON.parse(fileContent)
			searchData.artifacts = artifactsData
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
					searchData.bosses.push(bossData)
				} catch (error) {
					console.error(error)
				}
			}
		}
	} catch (error) {
		console.error(error)
	}

	return searchData
}

export default async function SidebarWrapper() {
	const searchData = await getSearchData()
	return <ClientSidebar searchData={searchData} />
}
