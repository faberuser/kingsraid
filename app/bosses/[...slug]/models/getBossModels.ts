import fs from "fs"
import path from "path"
import { ModelFile } from "@/model/Hero_Model"

// Changed to return a record of model variants (similar to hero costumes)
export type BossModelData = Record<string, ModelFile[]>

// Define type mappings for boss models
const TYPE_PATTERNS: Array<{ pattern: string; type: ModelFile["type"] }> = [
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
	{ pattern: "_Mesh", type: "body" }, // Keep Mesh as body type
	{ pattern: "_Body", type: "body" }, // Keep Mesh as body type
]

function getModelType(folderName: string): ModelFile["type"] | null {
	for (const { pattern, type } of TYPE_PATTERNS) {
		if (folderName.includes(pattern)) {
			return type
		}
	}
	return null
}

export async function getBossModels(bossName: string): Promise<BossModelData> {
	const modelsDir = path.join(process.cwd(), "public", "kingsraid-models", "models", "bosses")
	const bossModelData: BossModelData = {}

	try {
		// Check if boss folder exists
		const bossFolderPath = path.join(modelsDir, bossName)
		if (!fs.existsSync(bossFolderPath)) {
			console.warn(`Boss folder not found: ${bossName}`)
			return bossModelData
		}

		// Read the boss folder
		const folders = await fs.promises.readdir(bossFolderPath, { withFileTypes: true })

		// First, group folders by variant
		const variantGroups: { [variant: string]: string[] } = {}

		for (const folder of folders) {
			if (!folder.isDirectory()) continue

			// Skip scene folders
			if (folder.name.includes("_Scene") || folder.name.includes("Battlefield")) {
				continue
			}

			// Extract variant name from folder
			// e.g., "WorldBoss_MountainFortress_Vari01_Mesh" -> "Vari01"
			// e.g., "WorldBoss_MountainFortress_Cos18Chuseok_Weapon" -> "Cos18Chuseok"
			let variantName = folder.name

			// Remove common suffixes to get the variant base name
			variantName = variantName.replace(/_Mesh$/, "")
			variantName = variantName.replace(/_Weapon.*$/, "")
			variantName = variantName.replace(/_Handle$/, "")
			variantName = variantName.replace(/_Shield$/, "")
			variantName = variantName.replace(/_Sword$/, "")
			variantName = variantName.replace(/_Weapon_\w+$/, "")

			// Try to extract the variant part after the boss name
			const parts = variantName.split("_")
			if (parts.length > 2) {
				// Take the last meaningful part
				variantName = parts.slice(-1).join("_")
			}

			// If still too generic or empty, use a cleaned folder name
			if (!variantName || variantName === bossName.replace(/\s+/g, "")) {
				variantName = folder.name.replace(/_(?:Mesh|Weapon.*|Handle|Shield|Sword)$/, "")
			}

			// Initialize array for this variant if it doesn't exist
			if (!variantGroups[variantName]) {
				variantGroups[variantName] = []
			}

			variantGroups[variantName].push(folder.name)
		}

		// Now process each variant group
		for (const [variantName, folderNames] of Object.entries(variantGroups)) {
			const models: ModelFile[] = []

			for (const folderName of folderNames) {
				const folderPath = path.join(bossFolderPath, folderName)
				const files = await fs.promises.readdir(folderPath)
				const fbxFile = files.find((file) => file.endsWith(".fbx"))

				if (!fbxFile) continue

				const type = getModelType(folderName)
				if (!type) continue

				// Weapons should be visible by default for bosses (unlike heroes)
				// but still need defaultPosition=false so they get attached to hand points
				const isBodyPart = type === "body"

				models.push({
					name: `${variantName}_${type}`,
					path: `${bossName}/${folderName}/${fbxFile}`,
					type: type,
					defaultPosition: isBodyPart, // Only body has defaultPosition, weapons need attachment but should be visible
				})
			}

			if (models.length > 0) {
				bossModelData[variantName] = models
			}
		}

		return bossModelData
	} catch (error) {
		console.error(`Error loading boss models for ${bossName}:`, error)
		return bossModelData
	}
}
