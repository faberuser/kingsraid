import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import SlugClient from "@/app/heroes/[...slug]/client"
import { capitalize } from "@/lib/utils"
import { SlugPageProps, getFileData } from "@/components/server/get-data"
import { HeroData } from "@/model/Hero"

interface Costume {
	name: string
	path: string
	displayName: string
}

async function getCostumeData(costumePath: string): Promise<Costume[]> {
	if (!costumePath) return []

	try {
		const fullPath = path.join(process.cwd(), "public", "assets", costumePath)

		if (!fs.existsSync(fullPath)) {
			return []
		}

		const files = fs.readdirSync(fullPath)
		const imageFiles = files.filter((file) => file.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/))

		const costumes: Costume[] = imageFiles.map((filename) => {
			// Remove file extension for display name
			const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, "")

			// Create a more readable display name
			let displayName = nameWithoutExt

			// Handle numbered costumes (cos_01, cos_02, etc.)
			if (nameWithoutExt.match(/^cos_\d+$/)) {
				const number = nameWithoutExt.replace("cos_", "")
				displayName = `Costume ${parseInt(number)}`
			} else {
				// Capitalize and format other costume names
				displayName = capitalize(nameWithoutExt.replace(/_/g, " "))
			}

			return {
				name: nameWithoutExt,
				path: `${costumePath}/${encodeURIComponent(filename)}`,
				displayName,
			}
		})

		// Sort costumes: numbered ones first, then alphabetically
		costumes.sort((a, b) => {
			const aIsNumbered = a.name.match(/^cos_\d+$/)
			const bIsNumbered = b.name.match(/^cos_\d+$/)

			if (aIsNumbered && bIsNumbered) {
				// Both are numbered, sort by number
				const aNum = parseInt(a.name.replace("cos_", ""))
				const bNum = parseInt(b.name.replace("cos_", ""))
				return aNum - bNum
			} else if (aIsNumbered) {
				// Only a is numbered, it comes first
				return -1
			} else if (bIsNumbered) {
				// Only b is numbered, it comes first
				return 1
			} else {
				// Neither is numbered, sort alphabetically
				return a.displayName.localeCompare(b.displayName)
			}
		})

		return costumes
	} catch (error) {
		console.error("Error reading costume directory:", error)
		return []
	}
}

interface ModelFile {
	name: string
	path: string
	type: "body" | "hair" | "weapon" | "weapon01" | "weapon02"
}

export async function getHeroModels(heroName: string): Promise<{ [costume: string]: ModelFile[] }> {
	try {
		const modelsDir = path.join(process.cwd(), "kingsraid-models", "models")

		if (!fs.existsSync(modelsDir)) {
			return {}
		}

		const allDirs = fs.readdirSync(modelsDir)

		// Filter files for this hero
		const heroDirs = allDirs.filter((dir) => dir.startsWith(`Hero_${heroName}_`))
		if (heroDirs.length === 0) {
			return {}
		}
		// Flatten files from all relevant directories
		const heroFiles: string[] = []
		heroDirs.forEach((dir) => {
			const dirPath = path.join(modelsDir, dir)
			if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
				const files = fs.readdirSync(dirPath).filter((file) => file.endsWith(".fbx"))
				heroFiles.push(...files.map((file) => path.join(dir, file))) // Store relative path
			}
		})

		if (heroFiles.length === 0) {
			return {}
		}

		// Group by costume
		const modelsByCostume: { [costume: string]: ModelFile[] } = {}

		heroFiles.forEach((file) => {
			// Extract costume name from filename
			// Example: Hero_Aisha_Cos16SL_Body.fbx -> Cos16SL
			const match = file.match(/Hero_\w+_([^_]+)_(.+)\.fbx$/)
			if (match) {
				const costume = match[1]
				const component = match[2].toLowerCase()

				// Determine component type
				let type: ModelFile["type"] = "body"
				if (component.includes("hair")) type = "hair"
				else if (component.includes("weapon02")) type = "weapon02"
				else if (component.includes("weapon01") || component.includes("weapon")) type = "weapon"

				if (!modelsByCostume[costume]) {
					modelsByCostume[costume] = []
				}

				modelsByCostume[costume].push({
					name: file,
					path: file,
					type: type,
				})
			}
		})

		return modelsByCostume
	} catch (error) {
		console.error("Error fetching hero models:", error)
		return {}
	}
}

export default async function SlugPage({ params }: SlugPageProps) {
	const { slug } = await params
	const heroName = slug?.[0]

	if (!heroName) {
		notFound()
	}

	const heroData = (await getFileData(heroName, "heroes")) as HeroData | null

	if (!heroData) {
		notFound()
	}

	// Get costume data server-side
	const costumes = await getCostumeData(heroData.costumes)

	// Get model data server-side
	const heroModels = await getHeroModels(heroData.infos.name)

	return <SlugClient heroData={heroData} costumes={costumes} heroModels={heroModels} />
}
