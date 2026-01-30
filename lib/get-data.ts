import fs from "fs"
import path from "path"
import { capitalize } from "@/lib/utils"
import { HeroData } from "@/model/Hero"
import { BossData } from "@/model/Boss"
import { ArtifactData } from "@/model/Artifact"
import { DataVersion } from "@/hooks/use-data-version"

export interface SlugPageProps {
	params: Promise<{
		slug: string[]
	}>
}

type DataItem = HeroData | BossData | ArtifactData

// Map version to folder path for heroes
function getHeroFolderForVersion(version: DataVersion): string {
	switch (version) {
		case "cbt":
			return "cbt/heroes"
		case "ccbt":
			return "ccbt/heroes"
		case "legacy":
		default:
			return "legacy/heroes"
	}
}

// Map version to file path for artifacts
function getArtifactFileForVersion(version: DataVersion): string {
	switch (version) {
		case "cbt":
			return "cbt/artifacts.json"
		case "ccbt":
			return "ccbt/artifacts.json"
		case "legacy":
		default:
			return "legacy/artifacts.json"
	}
}

// Map version to file path for hero release order
function getHeroReleaseOrderForVersion(version: DataVersion): string {
	switch (version) {
		case "cbt":
			return "cbt/hero_release_order.json"
		case "ccbt":
			return "ccbt/hero_release_order.json"
		case "legacy":
		default:
			return "legacy/hero_release_order.json"
	}
}

// Map version to file path for artifact release order
function getArtifactReleaseOrderForVersion(version: DataVersion): string {
	switch (version) {
		case "cbt":
			return "cbt/artifact_release_order.json"
		case "ccbt":
			return "ccbt/artifact_release_order.json"
		case "legacy":
		default:
			return "legacy/artifact_release_order.json"
	}
}

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
	return item.profile.name
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
	options: { sortByName?: boolean; dataVersion?: DataVersion } = { sortByName: true },
): Promise<DataItem[]> {
	let actualSource = source

	// If dataVersion is provided, use the appropriate folder/file
	if (options.dataVersion) {
		if (source === "heroes") {
			actualSource = getHeroFolderForVersion(options.dataVersion)
		} else if (source === "artifacts" || source === "artifacts.json") {
			actualSource = getArtifactFileForVersion(options.dataVersion)
		}
	}

	const fullPath = buildPath("table-data", actualSource)

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
export async function findData(
	slug: string,
	source: string,
	options: { dataVersion?: DataVersion } = {},
): Promise<DataItem | null> {
	const normalizedSlug = decodeURIComponent(slug).toLowerCase().replace(/-/g, " ")

	let actualSource = source

	// If dataVersion is provided, use the appropriate folder/file
	if (options.dataVersion) {
		if (source === "heroes") {
			actualSource = getHeroFolderForVersion(options.dataVersion)
		} else if (source === "artifacts" || source === "artifacts.json") {
			actualSource = getArtifactFileForVersion(options.dataVersion)
		}
	}

	const fullPath = buildPath("table-data", actualSource)

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

// Check if a hero exists in a specific version's data folder
export async function heroExistsInVersion(heroName: string, version: DataVersion): Promise<boolean> {
	const normalizedName = decodeURIComponent(heroName).toLowerCase().replace(/-/g, " ")
	const capitalizedName = capitalize(normalizedName)
	const folder = getHeroFolderForVersion(version)
	const filePath = buildPath("table-data", folder, `${capitalizedName}.json`)
	return fs.existsSync(filePath)
}

// Get list of heroes that exist in a specific version's data folder
export async function getHeroNamesForVersion(version: DataVersion): Promise<string[]> {
	const folder = getHeroFolderForVersion(version)
	const heroesPath = buildPath("table-data", folder)

	if (!fs.existsSync(heroesPath)) {
		return []
	}

	const files = fs.readdirSync(heroesPath).filter((file) => file.endsWith(".json"))
	return files.map((file) => file.replace(".json", ""))
}

// Check if an artifact exists in a specific version's data
export async function artifactExistsInVersion(artifactName: string, version: DataVersion): Promise<boolean> {
	const normalizedName = decodeURIComponent(artifactName).toLowerCase().replace(/-/g, " ")
	const artifactFile = getArtifactFileForVersion(version)
	const filePath = buildPath("table-data", artifactFile)

	const data = await readJsonFile<ArtifactData[]>(filePath)
	if (!data) return false

	return data.some((artifact) => {
		const nameMatch = normalizeName(artifact.name) === normalizedName
		const aliasMatch = artifact.aliases?.some((alias) => normalizeName(alias) === normalizedName) ?? false
		return nameMatch || aliasMatch
	})
}

// Get list of artifact names that exist in a specific version's data
export async function getArtifactNamesForVersion(version: DataVersion): Promise<string[]> {
	const artifactFile = getArtifactFileForVersion(version)
	const filePath = buildPath("table-data", artifactFile)

	const data = await readJsonFile<ArtifactData[]>(filePath)
	if (!data) return []

	return data.map((artifact) => artifact.name)
}

// Get hero release order for a specific version
export async function getHeroReleaseOrder(version: DataVersion): Promise<Record<string, string>> {
	const releaseOrderFile = getHeroReleaseOrderForVersion(version)
	const filePath = buildPath("table-data", releaseOrderFile)
	const data = await readJsonFile<Record<string, string>>(filePath)
	return data ?? {}
}

// Get artifact release order for a specific version
export async function getArtifactReleaseOrder(version: DataVersion): Promise<Record<string, string>> {
	const releaseOrderFile = getArtifactReleaseOrderForVersion(version)
	const filePath = buildPath("table-data", releaseOrderFile)
	const data = await readJsonFile<Record<string, string>>(filePath)
	return data ?? {}
}

// Legacy function for backward compatibility - check if hero exists in CBT data
export async function heroExistsInNewData(heroName: string): Promise<boolean> {
	return heroExistsInVersion(heroName, "cbt")
}

// Legacy function for backward compatibility - get CBT hero names
export async function getNewDataHeroNames(): Promise<string[]> {
	return getHeroNamesForVersion("cbt")
}
