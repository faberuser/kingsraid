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

type DataItem = HeroData | BossData | ArtifactData

// Read and parse JSON files
async function readJsonFile<T>(filePath: string): Promise<T | null> {
	try {
		if (!fs.existsSync(filePath)) {
			return null
		}
		const fileContent = fs.readFileSync(filePath, "utf-8")
		return JSON.parse(fileContent)
	} catch (error) {
		console.error(`Error reading JSON file ${filePath}:`, error)
		return null
	}
}

// Build file path helper
function buildPath(...segments: string[]): string {
	return path.join(process.cwd(), "public", "kingsraid-data", ...segments)
}

// Helper function to get name from data item
function getName(item: DataItem): string {
	if ("name" in item) {
		return item.name
	}
	return item.infos.name
}

// Helper function to sort data by name
function sortByName(data: DataItem[]): DataItem[] {
	return data.sort((a, b) => getName(a).localeCompare(getName(b)))
}

// Get JSON data as object (key-value pairs)
export async function getJsonData(jsonFile: string): Promise<Record<string, string>> {
	const filePath = buildPath(jsonFile)
	const data = await readJsonFile<Record<string, string>>(filePath)
	return data ?? {}
}

// Get JSON data as array
export async function getJsonDataList(jsonFile: string): Promise<string[]> {
	const filePath = buildPath(jsonFile)
	const data = await readJsonFile<string[]>(filePath)
	return data ?? []
}

// Get all data from a file or directory
export async function getData(
	source: string,
	options: { sortByName?: boolean } = { sortByName: true }
): Promise<DataItem[]> {
	const fullPath = buildPath("table-data", source)

	// Check if source is a directory
	if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
		try {
			const files = fs.readdirSync(fullPath).filter((file) => file.endsWith(".json"))

			const dataPromises = files.map((file) => readJsonFile<DataItem>(path.join(fullPath, file)))

			const resolvedData = await Promise.all(dataPromises)
			const validData = resolvedData.filter((data): data is DataItem => data !== null)

			return options.sortByName ? sortByName(validData) : validData
		} catch (error) {
			console.error(`Error reading directory ${source}:`, error)
			return []
		}
	}

	// Otherwise, treat as a JSON file
	const data = await readJsonFile<DataItem[]>(fullPath)

	if (!data) return []

	return options.sortByName ? sortByName(data) : data
}

// Helper to normalize names for comparison
function normalizeName(str: string): string {
	return str
		.toLowerCase()
		.replace(/[\s\-]+/g, " ")
		.trim()
}

// Find single data by name/slug
export async function findData(slug: string, source: string): Promise<DataItem | null> {
	const normalizedSlug = decodeURIComponent(slug).toLowerCase().replace(/-/g, " ")
	const fullPath = buildPath("table-data", source)

	// Check if source is a directory (for heroes/bosses)
	if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
		const capitalizedSlug = capitalize(normalizedSlug)
		const filePath = path.join(fullPath, `${capitalizedSlug}.json`)
		return await readJsonFile<DataItem>(filePath)
	}

	// Otherwise, search in array (for artifacts)
	const data = await readJsonFile<DataItem[]>(fullPath)

	if (!data) return null

	// Try to find by normalized name match
	let found = data.find((item) => {
		return normalizeName(getName(item)) === normalizedSlug
	})

	// If not found by name, search by aliases (only for artifacts)
	if (!found) {
		found = data.find((item) => {
			if ("aliases" in item && item.aliases) {
				return item.aliases.some((alias) => normalizeName(alias) === normalizedSlug)
			}
			return false
		})
	}

	return found ?? null
}
