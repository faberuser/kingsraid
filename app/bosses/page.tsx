import fs from "fs"
import path from "path"
import BossesClient from "@/app/bosses/client"
import { BossData } from "@/model/Boss"

async function getBossesData(): Promise<BossData[]> {
	const bossesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "bosses")
	if (!fs.existsSync(bossesDir)) {
		return []
	}

	const files = fs.readdirSync(bossesDir)
	return files
		.filter((file) => file.endsWith(".json"))
		.map((file) => {
			const filePath = path.join(bossesDir, file)
			const bossData = JSON.parse(fs.readFileSync(filePath, "utf-8"))
			return bossData as BossData
		})
		.sort((a, b) => a.infos.name.localeCompare(b.infos.name))
}

export default async function BossesPage() {
	const bosses = await getBossesData()

	return <BossesClient bosses={bosses} />
}
