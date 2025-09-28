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

interface ModelFile {
	name: string
	path: string
	type: "body" | "hair" | "weapon" | "weapon01" | "weapon02"
}

interface HairTextureInfo {
	hair?: string
	ornament?: string
}

interface TextureInfo {
	diffuse?: string
	eye?: string
}

interface ModelWithTextures extends ModelFile {
	textures: TextureInfo | HairTextureInfo
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
		console.error(error)
		return []
	}
}

async function getHeroModels(heroName: string): Promise<{ [costume: string]: ModelWithTextures[] }> {
	const modelsDir = path.join(process.cwd(), "public", "models")
	const heroModels: { [costume: string]: ModelWithTextures[] } = {}

	try {
		const modelFolders = await fs.promises.readdir(modelsDir, { withFileTypes: true })

		// Filter folders that belong to this hero
		const heroFolders = modelFolders.filter(
			(folder) => folder.isDirectory() && folder.name.toLowerCase().startsWith(`hero_${heroName.toLowerCase()}_`)
		)

		// Group by costume name
		const costumeGroups: { [costume: string]: string[] } = {}

		heroFolders.forEach((folder) => {
			// Extract costume name from folder name
			// Hero_Aisha_Cos17Christmas_Body -> Cos17Christmas
			const match = folder.name.match(/Hero_\w+_(Cos\w+)_(\w+)/)
			if (match) {
				const costumeName = match[1] // e.g., "Cos17Christmas"
				const componentType = match[2] // e.g., "Body", "Hair", "Weapon01"

				if (!costumeGroups[costumeName]) {
					costumeGroups[costumeName] = []
				}
				costumeGroups[costumeName].push(folder.name)
			}
		})

		// Helper function to scan for textures in a folder
		const scanFolderForTextures = async (
			folderPath: string,
			folderName: string
		): Promise<TextureInfo | HairTextureInfo> => {
			const textures: TextureInfo = {}

			try {
				const files = await fs.promises.readdir(folderPath)

				// Common texture extensions
				const textureExtensions = [".png"]
				const textureFiles = files.filter((file) =>
					textureExtensions.some((ext) => file.toLowerCase().endsWith(ext))
				)

				// Extract model base name for better matching
				const modelBaseName = folderName.replace(/^Hero_\w+_/, "").replace(/_\w+$/, "")

				if (folderName.includes("_Hair")) {
					const hairTextures: HairTextureInfo = {}

					// Look for hair textures
					const hairFile = textureFiles.find(
						(file) => file.includes("_Hair") && (file.includes("_D(RGB)") || file.includes("_D."))
					)
					if (hairFile) {
						hairTextures.hair = `${folderName}/${hairFile}`
					}
					// Look for ornament textures
					const ornamentFile = textureFiles.find(
						(file) => file.includes("AC_D(RGB)") || file.includes("AC_D.")
					)
					if (ornamentFile) {
						hairTextures.ornament = `${folderName}/${ornamentFile}`
					}
					return hairTextures
				}

				// Look for diffuse textures - prefer exact matches first
				let diffuseFile = textureFiles.find(
					(file) => file.includes(`${modelBaseName}_D(RGB)`) || file.includes(`${modelBaseName}_D.`)
				)

				// Fallback to more general patterns
				if (!diffuseFile) {
					diffuseFile = textureFiles.find((file) => file.includes("_D(RGB)") || file.includes("_D."))
				}

				if (diffuseFile) {
					textures.diffuse = `${folderName}/${diffuseFile}`
				}

				// Look for eye textures (for body models)
				if (folderName.includes("_Body")) {
					const eyeFile = textureFiles.find(
						(file) =>
							file.toLowerCase().includes("eye") && (file.includes("_D(RGB)") || file.includes("_D."))
					)
					if (eyeFile) {
						textures.eye = `${folderName}/${eyeFile}`
					}
				}

				return textures
			} catch (error) {
				console.warn(error)
				return {}
			}
		}

		// Process each costume group
		for (const [costumeName, folders] of Object.entries(costumeGroups)) {
			const models: ModelWithTextures[] = []

			for (const folderName of folders) {
				const folderPath = path.join(modelsDir, folderName)

				try {
					const files = await fs.promises.readdir(folderPath)
					const fbxFile = files.find((file) => file.endsWith(".fbx"))

					if (fbxFile) {
						// Determine component type
						let type: "body" | "hair" | "weapon" | "weapon01" | "weapon02"

						if (folderName.includes("_Body")) {
							type = "body"
						} else if (folderName.includes("_Hair")) {
							type = "hair"
						} else if (folderName.includes("_Weapon01")) {
							type = "weapon01"
						} else if (folderName.includes("_Weapon02")) {
							type = "weapon02"
						} else if (folderName.includes("_Weapon")) {
							type = "weapon"
						} else {
							continue // Skip unknown types
						}

						// Scan for textures in this folder
						const textures = await scanFolderForTextures(folderPath, folderName)

						models.push({
							name: `${costumeName}_${type}`,
							path: `${folderName}/${fbxFile}`,
							type: type,
							textures: textures,
						})
					}
				} catch (error) {
					console.warn(error)
				}
			}

			// Only add costume if it has at least a body model
			if (models.some((m) => m.type === "body")) {
				heroModels[costumeName] = models
			}
		}

		return heroModels
	} catch (error) {
		console.error(error)
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
