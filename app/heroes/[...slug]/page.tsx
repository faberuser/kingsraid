import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import SlugClient from "@/app/heroes/[...slug]/client"
import { capitalize } from "@/lib/utils"
import { SlugPageProps, getFileData } from "@/components/server/get-data"
import { HeroData } from "@/model/Hero"
import { Costume, ModelFile, HairTextureInfo, TextureInfo, ModelWithTextures } from "@/model/Hero_Model"

async function getCostumeData(costumePath: string): Promise<Costume[]> {
	if (!costumePath) return []

	try {
		const fullPath = path.join(process.cwd(), "public", "kingsraid-data", "assets", costumePath)

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
		console.error("Error reading costume data:", error)
		return []
	}
}

async function getHeroModels(heroName: string): Promise<{ [costume: string]: ModelWithTextures[] }> {
	const modelsDir = path.join(process.cwd(), "public", "kingsraid-models", "models", "heroes")
	const heroModels: { [costume: string]: ModelWithTextures[] } = {}

	// Load name_diff.json
	let nameDiff: Record<string, string> = {}
	try {
		const nameDiffPath = path.join(process.cwd(), "public", "kingsraid-models", "name_diff.json")
		const raw = fs.readFileSync(nameDiffPath, "utf-8")
		nameDiff = JSON.parse(raw)
	} catch (e) {
		console.warn(e)
	}

	// Load hair_fallback.json
	let hairFallback: Record<string, string> = {}
	try {
		const hairFallbackPath = path.join(process.cwd(), "public", "kingsraid-models", "hair_fallback.json")
		if (fs.existsSync(hairFallbackPath)) {
			const raw = fs.readFileSync(hairFallbackPath, "utf-8")
			hairFallback = JSON.parse(raw)
		}
	} catch (e) {
		console.warn(e)
	}

	// Load weapon_fallback.json
	let weaponFallback: Record<string, string> = {}
	try {
		const weaponFallbackPath = path.join(process.cwd(), "public", "kingsraid-models", "weapon_fallback.json")
		if (fs.existsSync(weaponFallbackPath)) {
			const raw = fs.readFileSync(weaponFallbackPath, "utf-8")
			weaponFallback = JSON.parse(raw)
		}
	} catch (e) {
		console.warn(e)
	}

	// Load weapon_defaultpos.json for default position
	let defaultPosHeroes: string[] = []
	try {
		const defaultPosPath = path.join(process.cwd(), "public", "kingsraid-models", "weapon_defaultpos.json")
		if (fs.existsSync(defaultPosPath)) {
			const raw = fs.readFileSync(defaultPosPath, "utf-8")
			defaultPosHeroes = JSON.parse(raw)
		}
	} catch (e) {
		console.warn(e)
	}

	// Use mapped name if available
	const mappedHeroName = nameDiff[heroName] || heroName

	try {
		const modelFolders = await fs.promises.readdir(modelsDir, { withFileTypes: true })

		// Filter folders that belong to this hero
		const heroFolders = modelFolders.filter(
			(folder) =>
				(folder.isDirectory() &&
					folder.name.toLowerCase().startsWith(`hero_${mappedHeroName.toLowerCase()}_vari`)) ||
				folder.name.toLowerCase().startsWith(`hero_${mappedHeroName.toLowerCase()}_cos`) ||
				folder.name.toLowerCase().startsWith(`hero_${mappedHeroName.toLowerCase()}_substory`)
		)

		// Group by costume name
		const costumeGroups: { [costume: string]: string[] } = {}

		heroFolders.forEach((folder) => {
			// Extract costume name from folder name
			// Case 1: Hero_Lewsia_Vari03_Cos17Summer_Body -> Vari03_Cos17Summer
			// Case 2: Hero_Lewsia_Vari03_Body -> Vari03
			// Case 3: Hero_Isaiah_Cos21Advance_Weapon_A -> Cos21Advance
			// Case 4: Hero_Roi_Substory01_01_Body -> Substory01_01

			// First, try to match Vari with optional Cos suffix
			let match = folder.name.match(/Hero_\w+_(Vari\w+)_(Cos\w+)_/)
			if (match) {
				// Case: Vari03_Cos17Summer
				const costumeName = `${match[1]}_${match[2]}`
				if (!costumeGroups[costumeName]) {
					costumeGroups[costumeName] = []
				}
				costumeGroups[costumeName].push(folder.name)
				return
			}

			// Second, try to match Substory with number suffix
			match = folder.name.match(/Hero_\w+_(Substory\w+)_/)
			if (match) {
				// Case: Substory01_01 or Substory01
				const costumeName = match[1]
				if (!costumeGroups[costumeName]) {
					costumeGroups[costumeName] = []
				}
				costumeGroups[costumeName].push(folder.name)
				return
			}

			// Third, try to match just Vari or Cos
			match = folder.name.match(/Hero_\w+_((?:Cos|Vari)\w+?)_/)
			if (match) {
				const costumeName = match[1] // e.g., "Vari03" or "Cos21Advance"
				if (!costumeGroups[costumeName]) {
					costumeGroups[costumeName] = []
				}
				costumeGroups[costumeName].push(folder.name)
			}
		})

		// Helper function to scan for textures in a folder
		const scanFolderForTextures = async (
			folderPath: string,
			folderName: string,
			type?: ModelFile["type"]
		): Promise<TextureInfo | HairTextureInfo> => {
			try {
				const files = await fs.promises.readdir(folderPath)

				// Common texture extensions
				const textureExtensions = [".png"]
				const textureFiles = files.filter((file) =>
					textureExtensions.some((ext) => file.toLowerCase().endsWith(ext))
				)

				// Extract model base name for better matching
				const modelBaseName = folderName.replace(/^Hero_\w+_/, "").replace(/_\w+$/, "")

				if (folderName.includes("_Hair") || type === "hair") {
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

				// For non-hair models, collect ALL diffuse textures
				const textures: TextureInfo & { additionalTextures?: { [materialName: string]: string } } = {}

				// Find all diffuse textures (files containing _D(RGB) or _D. or (Color))
				let remainingTextures = textureFiles.filter(
					(file) => file.includes("_D(RGB)") || file.includes("_D.") || file.includes("(Color)")
				)

				// Categorize textures
				for (const textureFile of [...remainingTextures]) {
					const lowerFile = textureFile.toLowerCase()

					// Eye texture
					if (lowerFile.includes("eye")) {
						textures.eye = `${folderName}/${textureFile}`
						remainingTextures = remainingTextures.filter((f) => f !== textureFile)
					}
					// Wing texture
					else if (lowerFile.includes("wing")) {
						textures.wing = `${folderName}/${textureFile}`
						remainingTextures = remainingTextures.filter((f) => f !== textureFile)
					}
					// Arms texture (check before arm to avoid conflict)
					else if (lowerFile.includes("arms")) {
						textures.arm = `${folderName}/${textureFile}`
						remainingTextures = remainingTextures.filter((f) => f !== textureFile)
					}
					// Arm texture
					else if (lowerFile.includes("arm")) {
						textures.arm = `${folderName}/${textureFile}`
						remainingTextures = remainingTextures.filter((f) => f !== textureFile)
					}
					// Effect texture
					else if (lowerFile.includes("effect")) {
						textures.effect = `${folderName}/${textureFile}`
						remainingTextures = remainingTextures.filter((f) => f !== textureFile)
					}
					// Mask texture
					else if (lowerFile.includes("mask")) {
						textures.mask = `${folderName}/${textureFile}`
						remainingTextures = remainingTextures.filter((f) => f !== textureFile)
					}
				}

				// Main diffuse texture from remaining textures (prefer exact match)
				if (!textures.diffuse && remainingTextures.length > 0) {
					const exactMatch = remainingTextures.find(
						(file) => file.includes(`${modelBaseName}_D(RGB)`) || file.includes(`${modelBaseName}_D.`)
					)
					if (exactMatch) {
						textures.diffuse = `${folderName}/${exactMatch}`
						remainingTextures = remainingTextures.filter((f) => f !== exactMatch)
					}
				}

				// If no main diffuse found yet, use the first remaining one
				if (!textures.diffuse && remainingTextures.length > 0) {
					textures.diffuse = `${folderName}/${remainingTextures[0]}`
					remainingTextures = remainingTextures.filter((f, i) => i !== 0)
				}

				// Store additional textures with their material names
				const additionalTextures: { [key: string]: string } = {}
				for (const textureFile of remainingTextures) {
					const lowerFile = textureFile.toLowerCase()
					// Skip already categorized textures
					if (
						lowerFile.includes("eye") ||
						lowerFile.includes("wing") ||
						lowerFile.includes("arms") ||
						lowerFile.includes("arm") ||
						lowerFile.includes("effect") ||
						lowerFile.includes("mask")
					) {
						continue
					}

					// Extract material name from texture filename
					// Examples:
					// Hero_Chase_Vari05_Body01_D(RGB).png -> body01
					// Hero_Chase_Vari05_Body02_D(RGB).png -> body02
					// Hero_Clause_Vari05_02_D(RGB).png -> 02
					// Hero_Clause_Vari05_etc_D(RGB).png -> etc
					// Hero_Fluss_Cos18Halloween_Body_Effect(Color).png -> effect

					// Try multiple patterns to extract material name
					let materialName = ""

					// Pattern 1: _MaterialName_D (most common)
					let matMatch = textureFile.match(/_([^_]+)_D(?:\(RGB\)|\.)/i)
					if (matMatch) {
						materialName = matMatch[1].toLowerCase()
					}

					// Pattern 2: _MaterialName(Color) for effect textures
					if (!materialName) {
						matMatch = textureFile.match(/_([^_]+)\(Color\)/i)
						if (matMatch) {
							materialName = matMatch[1].toLowerCase()
						}
					}

					// If material name is too generic (like just the hero name), skip it
					if (
						!materialName ||
						materialName.includes("vari") ||
						materialName.includes("cos") ||
						materialName === "d" ||
						additionalTextures[materialName]
					) {
						continue
					}
					additionalTextures[materialName] = `${folderName}/${textureFile}`
				}

				if (Object.keys(additionalTextures).length > 0) {
					textures.additionalTextures = additionalTextures
				}

				if (Object.keys(additionalTextures).length > 0) {
					textures.additionalTextures = additionalTextures
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
				// Skip facial mesh folders
				if (folderName.toLowerCase().includes("_facial") || folderName.toLowerCase().includes("extra")) {
					continue
				}

				const folderPath = path.join(modelsDir, folderName)

				try {
					const files = await fs.promises.readdir(folderPath)
					const fbxFile = files.find((file) => file.endsWith(".fbx"))

					if (fbxFile) {
						// Determine component type - CHECK ORDER CAREFULLY
						let type: ModelFile["type"]

						if (folderName.includes("_Body") || folderName.includes("_Mesh")) {
							type = "body"
						} else if (folderName.includes("_Arms")) {
							type = "arms"
						} else if (folderName.includes("_Arm")) {
							type = "arm"
						} else if (folderName.includes("_Hair")) {
							type = "hair"
						} else if (folderName.includes("_Weapon_Blue")) {
							type = "weapon_blue"
						} else if (folderName.includes("_Weapon_Red")) {
							type = "weapon_red"
						} else if (folderName.includes("_Weapon_Open")) {
							type = "weapon_open"
						} else if (folderName.includes("_Weapon_Close")) {
							type = "weapon_close"
						} else if (folderName.includes("_Weapon_A")) {
							type = "weapon_a"
						} else if (folderName.includes("_Weapon_B")) {
							type = "weapon_b"
						} else if (folderName.includes("_WeaponA")) {
							type = "weapona"
						} else if (folderName.includes("_WeaponB")) {
							type = "weaponb"
						} else if (folderName.includes("_Weapon_L")) {
							type = "weapon_l"
						} else if (folderName.includes("_Weapon_R")) {
							type = "weapon_r"
						} else if (folderName.includes("_WeaponL")) {
							type = "weaponl"
						} else if (folderName.includes("_WeaponR")) {
							type = "weaponr"
						} else if (folderName.includes("_Weapon01")) {
							type = "weapon01"
						} else if (folderName.includes("_Weapon02")) {
							type = "weapon02"
						} else if (folderName.includes("_WeaponBottle")) {
							type = "weaponbottle"
						} else if (folderName.includes("_WeaponPen")) {
							type = "weaponpen"
						} else if (folderName.includes("_WeaponScissors")) {
							type = "weaponscissors"
						} else if (folderName.includes("_WeaponSkein")) {
							type = "weaponskein"
						} else if (folderName.includes("_Handle")) {
							type = "handle"
						} else if (folderName.includes("_Weapon")) {
							type = "weapon"
						} else if (folderName.includes("_Shield")) {
							type = "shield"
						} else if (folderName.includes("_Sword")) {
							type = "sword"
						} else if (folderName.includes("_Lance")) {
							type = "lance"
						} else if (folderName.includes("_Gunblade")) {
							type = "gunblade"
						} else if (folderName.includes("_Axe")) {
							type = "axe"
						} else if (folderName.includes("_Arrow")) {
							type = "arrow"
						} else if (folderName.includes("_Quiver")) {
							type = "quiver"
						} else if (folderName.includes("_Sheath")) {
							type = "sheath"
						} else {
							continue // Skip unknown types
						}

						// Scan for textures in this folder
						const textures = await scanFolderForTextures(folderPath, folderName)

						// Check if hero in weapon_defaultpos.json for default position
						const defaultPos = defaultPosHeroes.includes(mappedHeroName)

						models.push({
							name: `${costumeName}_${type}`,
							path: `${folderName}/${fbxFile}`,
							type: type,
							defaultPosition: defaultPos,
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

		// Only fallback for hair and one weapon type if missing
		for (const [costumeName, models] of Object.entries(heroModels)) {
			// Hair fallback (unchanged)
			if (!models.some((m) => m.type === "hair")) {
				let found: ModelWithTextures | undefined

				// Check hair_fallback.json for this costume
				if (hairFallback[`Hero_${mappedHeroName}_${costumeName}`]) {
					const fallbackFolder = hairFallback[`Hero_${mappedHeroName}_${costumeName}`]
					const fallbackPath = path.join(modelsDir, fallbackFolder)
					try {
						const files = await fs.promises.readdir(fallbackPath)
						const fbxFile = files.find((file) => file.endsWith(".fbx"))
						if (fbxFile) {
							const textures = await scanFolderForTextures(fallbackPath, fallbackFolder, "hair")
							found = {
								name: `${costumeName}_hair`,
								path: `${fallbackFolder}/${fbxFile}`,
								type: "hair",
								textures: textures,
							}
						}
					} catch (e) {
						console.warn(e)
					}
				}

				// If not found, fallback to any other costume's hair
				// if (!found) {
				// 	for (const [otherCostume, otherModels] of Object.entries(heroModels)) {
				// 		if (otherCostume === costumeName) continue
				// 		found = otherModels.find((m) => m.type === "hair")
				// 		if (found) break
				// 	}
				// }

				if (found) {
					models.push({
						...found,
						name: `${costumeName}_hair`,
					})
				}
			}

			// Weapon fallback: only if none of the weapon types exist
			const weaponTypes: ModelFile["type"][] = [
				"weapon",
				"weapon01",
				"weapon02",
				"weapon_open",
				"weapon_close",
				"weapon_a",
				"weapon_b",
				"weapon_l",
				"weapon_r",
				"weaponbottle",
				"weaponpen",
				"shield",
				"sword",
				"lance",
				"gunblade",
			]

			const hasWeapon = models.some((m) => weaponTypes.includes(m.type))

			if (!hasWeapon) {
				// Check weapon_fallback.json for this costume
				const fallbackKey = `Hero_${mappedHeroName}_${costumeName}`
				if (weaponFallback[fallbackKey]) {
					const fallbackValue = weaponFallback[fallbackKey]
					// Support both string and array of strings
					const fallbackFolders = Array.isArray(fallbackValue) ? fallbackValue : [fallbackValue]

					for (const fallbackFolder of fallbackFolders) {
						const fallbackPath = path.join(modelsDir, fallbackFolder)
						try {
							const files = await fs.promises.readdir(fallbackPath)
							const fbxFile = files.find((file) => file.endsWith(".fbx"))
							if (fbxFile) {
								// Determine weapon type from folder name
								let type: ModelFile["type"] = "weapon"
								if (fallbackFolder.includes("_Weapon01")) type = "weapon01"
								else if (fallbackFolder.includes("_Weapon02")) type = "weapon02"
								else if (fallbackFolder.includes("_Weapon_Blue")) type = "weapon_blue"
								else if (fallbackFolder.includes("_Weapon_Red")) type = "weapon_red"
								else if (fallbackFolder.includes("_Weapon_Open")) type = "weapon_open"
								else if (fallbackFolder.includes("_Weapon_Close")) type = "weapon_close"
								else if (fallbackFolder.includes("_Weapon_A")) type = "weapon_a"
								else if (fallbackFolder.includes("_Weapon_B")) type = "weapon_b"
								else if (fallbackFolder.includes("_WeaponA")) type = "weapona"
								else if (fallbackFolder.includes("_WeaponB")) type = "weaponb"
								else if (fallbackFolder.includes("_Weapon_L")) type = "weapon_l"
								else if (fallbackFolder.includes("_Weapon_R")) type = "weapon_r"
								else if (fallbackFolder.includes("_WeaponL")) type = "weaponl"
								else if (fallbackFolder.includes("_WeaponR")) type = "weaponr"
								else if (fallbackFolder.includes("_WeaponBottle")) type = "weaponbottle"
								else if (fallbackFolder.includes("_WeaponPen")) type = "weaponpen"
								else if (fallbackFolder.includes("_WeaponScissors")) type = "weaponscissors"
								else if (fallbackFolder.includes("_weaponskein")) type = "weaponskein"
								else if (fallbackFolder.includes("_Shield")) type = "shield"
								else if (fallbackFolder.includes("_Sword")) type = "sword"
								else if (fallbackFolder.includes("_Lance")) type = "lance"
								else if (fallbackFolder.includes("_Gunblade")) type = "gunblade"
								else if (fallbackFolder.includes("_Axe")) type = "axe"
								else if (fallbackFolder.includes("_Arrow")) type = "arrow"
								else if (fallbackFolder.includes("_Quiver")) type = "quiver"
								else if (fallbackFolder.includes("_Sheath")) type = "sheath"
								else if (fallbackFolder.includes("_Weapon")) type = "weapon"

								const textures = await scanFolderForTextures(fallbackPath, fallbackFolder)
								const weaponModel: ModelWithTextures = {
									name: `${costumeName}_${type}`,
									path: `${fallbackFolder}/${fbxFile}`,
									type: type,
									textures: textures,
								}
								models.push(weaponModel)
							}
						} catch (e) {
							console.warn(e)
						}
					}
				}
			}
		}

		return heroModels
	} catch (error) {
		console.error("Error reading hero models:", error)
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
