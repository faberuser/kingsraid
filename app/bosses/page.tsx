import fs from "fs"
import path from "path"
import BossesClient from "@/app/bosses/client"
import { BossData } from "@/model/Boss"

async function getBossesData(): Promise<BossData[]> {
	try {
		const bossesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "bosses")
		const files = fs.readdirSync(bossesDir)
		const jsonFiles = files.filter((file) => file.endsWith(".json"))

		const bosses: BossData[] = []

		for (const file of jsonFiles) {
			const filePath = path.join(bossesDir, file)
			const fileContent = fs.readFileSync(filePath, "utf-8")
			const bossData = JSON.parse(fileContent)
			bosses.push(bossData)
		}

		// Sort bosses alphabetically by class name
		return bosses.sort((a, b) => a.infos.class.localeCompare(b.infos.class))
	} catch (error) {
		console.error("Error reading bosses directory:", error)
		return []
	}
}

export default async function BossesPage() {
	const bosses = await getBossesData()

	return <BossesClient bosses={bosses} />
}
