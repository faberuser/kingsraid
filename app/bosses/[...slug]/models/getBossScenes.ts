import fs from "fs"
import path from "path"

export async function getBossScenes(bossName: string): Promise<Array<{ value: string; label: string }>> {
	const bossesDir = path.join(process.cwd(), "public", "kingsraid-models", "models", "bosses")
	const scenes: Array<{ value: string; label: string }> = [{ value: "grid", label: "Grid" }]

	try {
		const bossFolderPath = path.join(bossesDir, bossName)

		if (!fs.existsSync(bossFolderPath)) {
			return scenes
		}

		const folders = fs.readdirSync(bossFolderPath, { withFileTypes: true })

		for (const folder of folders) {
			if (!folder.isDirectory()) continue

			// Check if this is a battlefield scene
			if (folder.name.includes("BattleFieldMap") || folder.name.includes("Field")) {
				const files = fs.readdirSync(path.join(bossFolderPath, folder.name))
				const fbxFile = files.find((file) => file.endsWith(".fbx"))

				if (fbxFile) {
					// Create a scene entry with the path
					scenes.push({
						value: `bosses/${bossName}/${folder.name}`,
						label: `${bossName} Battlefield`,
					})
				}
			}
		}
	} catch (error) {
		console.error(`Error loading boss scenes for ${bossName}:`, error)
	}

	return scenes
}
