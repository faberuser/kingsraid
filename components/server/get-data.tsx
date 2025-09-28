import fs from "fs"
import path from "path"
import { HeroData } from "@/model/Hero"
import { BossData } from "@/model/Boss"
import { capitalize } from "@/lib/utils"

export interface SlugPageProps {
	params: Promise<{
		slug: string[]
	}>
}

export async function getDirData(objName: string, dirName: string): Promise<HeroData | BossData | null> {
	try {
		const dir = path.join(process.cwd(), "kingsraid-data", "table-data", dirName)
		const normalizedSlug = capitalize(decodeURIComponent(objName).toLowerCase().replace(/-/g, " "))
		const filePath = path.join(dir, `${normalizedSlug}.json`)

		if (!fs.existsSync(filePath)) {
			return null
		}

		return JSON.parse(fs.readFileSync(filePath, "utf8"))
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function getData(dirName: string): Promise<HeroData[] | BossData[]> {
	const heroesDir = path.join(process.cwd(), "kingsraid-data", "table-data", dirName)
	if (!fs.existsSync(heroesDir)) {
		return []
	}

	const files = fs.readdirSync(heroesDir)
	return files
		.filter((file) => file.endsWith(".json"))
		.map((file) => {
			const filePath = path.join(heroesDir, file)
			const heroData = JSON.parse(fs.readFileSync(filePath, "utf8"))
			return heroData as HeroData
		})
		.sort((a, b) => a.infos.name.localeCompare(b.infos.name))
}
