import fs from "fs"
import path from "path"
import { ModelFile } from "@/model/Hero_Model"

// Define type mappings (most specific patterns first)
const TYPE_PATTERNS: Array<{ pattern: string; type: ModelFile["type"] }> = [
	// Determine component type - CHECK ORDER CAREFULLY
	{ pattern: "_HoodOpen_Hair", type: "hoodopen_hair" },
	{ pattern: "_HoodOpen", type: "hoodopen" },
	{ pattern: "_Hood_Hair", type: "hood_hair" },
	{ pattern: "_Hood", type: "hood" },
	{ pattern: "_Body", type: "body" },
	{ pattern: "_Mesh", type: "body" },
	{ pattern: "_Normal", type: "body" },
	{ pattern: "_Arms", type: "arms" },
	{ pattern: "_Arm", type: "arm" },
	{ pattern: "_Hair", type: "hair" },
	{ pattern: "_Weapon_Blue", type: "weapon_blue" },
	{ pattern: "_Weapon_Red", type: "weapon_red" },
	{ pattern: "_Weapon_Open", type: "weapon_open" },
	{ pattern: "_Weapon_Close", type: "weapon_close" },
	{ pattern: "_Weapon_A", type: "weapon_a" },
	{ pattern: "_Weapon_B", type: "weapon_b" },
	{ pattern: "_WeaponA", type: "weapona" },
	{ pattern: "_WeaponB", type: "weaponb" },
	{ pattern: "_Weapon_L", type: "weapon_l" },
	{ pattern: "_Weapon_R", type: "weapon_r" },
	{ pattern: "_WeaponL", type: "weaponl" },
	{ pattern: "_WeaponR", type: "weaponr" },
	{ pattern: "_Weapon01", type: "weapon01" },
	{ pattern: "_Weapon02", type: "weapon02" },
	{ pattern: "_WeaponBottle", type: "weaponbottle" },
	{ pattern: "_WeaponPen", type: "weaponpen" },
	{ pattern: "_WeaponScissors", type: "weaponscissors" },
	{ pattern: "_WeaponSkein", type: "weaponskein" },
	{ pattern: "_Handle", type: "handle" },
	{ pattern: "_Weapon", type: "weapon" },
	{ pattern: "_Shield", type: "shield" },
	{ pattern: "_Sword", type: "sword" },
	{ pattern: "_Lance", type: "lance" },
	{ pattern: "_Gunblade", type: "gunblade" },
	{ pattern: "_Axe", type: "axe" },
	{ pattern: "_Arrow", type: "arrow" },
	{ pattern: "_Quiver", type: "quiver" },
	{ pattern: "_Sheath", type: "sheath" },
	{ pattern: "_Bag", type: "bag" },
	{ pattern: "_Mask", type: "mask" },
]

function getModelType(folderName: string): ModelFile["type"] | null {
	for (const { pattern, type } of TYPE_PATTERNS) {
		if (folderName.includes(pattern)) {
			return type
		}
	}
	return null
}

export async function getHeroModels(heroName: string): Promise<{ [costume: string]: ModelFile[] }> {
	const modelsDir = path.join(process.cwd(), "public", "kingsraid-models", "models", "heroes")
	const heroModels: { [costume: string]: ModelFile[] } = {}

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

		// Process each costume group
		for (const [costumeName, folders] of Object.entries(costumeGroups)) {
			const models: ModelFile[] = []

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
						const type = getModelType(folderName)
						if (!type) {
							continue // Skip unknown types
						}

						// Check if hero in weapon_defaultpos.json for default position
						const defaultPos = defaultPosHeroes.includes(mappedHeroName)

						models.push({
							name: `${costumeName}_${type}`,
							path: `${folderName}/${fbxFile}`,
							type: type,
							defaultPosition: defaultPos,
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
				let found: ModelFile | undefined

				// Check hair_fallback.json for this costume
				if (hairFallback[`Hero_${mappedHeroName}_${costumeName}`]) {
					const fallbackFolder = hairFallback[`Hero_${mappedHeroName}_${costumeName}`]
					const fallbackPath = path.join(modelsDir, fallbackFolder)
					try {
						const files = await fs.promises.readdir(fallbackPath)
						const fbxFile = files.find((file) => file.endsWith(".fbx"))
						if (fbxFile) {
							found = {
								name: `${costumeName}_hair`,
								path: `${fallbackFolder}/${fbxFile}`,
								type: "hair",
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
				// "weapon_open",
				// "weapon_close",
				// "weapon_red",
				// "weapon_blue",
				// "weapon_a",
				// "weapon_b",
				// "weapona",
				// "weaponb",
				// "weapon_l",
				// "weapon_r",
				// "weaponr",
				// "weaponl",
				// "weaponbottle",
				// "weaponpen",
				// "shield",
				// "sword",
				// "lance",
				// "gunblade",
				// "axe",
				// "arrow",
				// "quiver",
				// "sheath",
				// "handle",
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
								if (fallbackFolder.includes("_Weapon")) type = "weapon"

								const weaponModel: ModelFile = {
									name: `${costumeName}_${type}`,
									path: `${fallbackFolder}/${fbxFile}`,
									type: type,
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
		console.error(error)
		return {}
	}
}
