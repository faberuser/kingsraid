import fs from "fs"
import path from "path"
import { capitalize } from "@/lib/utils"
import { HeroData } from "@/model/Hero"
import { BossData } from "@/model/Boss"
import { ArtifactData } from "@/model/Artifact"

export interface SlugPageProps {
	params: Promise<{
		slug: string[]
	}>
}

export async function getFileData(objName: string, dirName: string): Promise<HeroData | BossData | null> {
	try {
		const dir = path.join(process.cwd(), "public", "kingsraid-data", "table-data", dirName)
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

export async function getDirData(dirName: string): Promise<HeroData[] | BossData[]> {
	const heroesDir = path.join(process.cwd(), "public", "kingsraid-data", "table-data", dirName)
	if (!fs.existsSync(heroesDir)) {
		return []
	}

	const files = fs.readdirSync(heroesDir)
	return (
		files
			.filter((file) => file.endsWith(".json"))
			// Read and parse each JSON file
			.map((file) => {
				const filePath = path.join(heroesDir, file)
				const heroData = JSON.parse(fs.readFileSync(filePath, "utf8"))
				return heroData as HeroData
			})
			// Sort objs alphabetically by name
			.sort((a, b) => a.infos.name.localeCompare(b.infos.name))
	)
}

export async function getJsonData(jsonFile: string): Promise<ArtifactData[]> {
	try {
		const objsFile = path.join(process.cwd(), "public", "kingsraid-data", "table-data", jsonFile)

		if (!fs.existsSync(objsFile)) {
			return []
		}

		const fileContent = fs.readFileSync(objsFile, "utf-8")
		const data: ArtifactData[] = JSON.parse(fileContent)

		// Sort objs alphabetically by name
		return data.sort((a, b) => a.name.localeCompare(b.name))
	} catch (error) {
		console.error(error)
		return []
	}
}

export async function findData(objName: string, jsonFile: string): Promise<ArtifactData | null> {
	try {
		const objsFile = path.join(process.cwd(), "public", "kingsraid-data", "table-data", jsonFile)
		const fileContent = fs.readFileSync(objsFile, "utf-8")
		const data: ArtifactData[] = JSON.parse(fileContent)

		// Convert slug back to obj name format
		const normalizedSlug = decodeURIComponent(objName).toLowerCase().replace(/-/g, " ")

		// Try to find obj by exact name match (case insensitive)
		let foundObj = data.find((obj) => obj.name.toLowerCase() === normalizedSlug)

		// If not found by name, search by aliases
		if (!foundObj) {
			foundObj = data.find((obj) => obj.aliases?.some((alias) => alias.toLowerCase() === normalizedSlug))
		}

		if (!foundObj) {
			return null
		}

		return foundObj
	} catch (error) {
		console.error(error)
		return null
	}
}
