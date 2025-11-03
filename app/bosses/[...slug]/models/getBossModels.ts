import fs from "fs"
import path from "path"
import { ModelFile } from "@/model/Hero_Model"

interface BossModelData {
	mesh: ModelFile | null
}

export async function getBossModels(bossName: string): Promise<BossModelData> {
	const modelsDir = path.join(process.cwd(), "public", "kingsraid-models", "models", "bosses")
	const bossModelData: BossModelData = {
		mesh: null,
	}

	try {
		// Check if boss folder exists
		const bossFolderPath = path.join(modelsDir, bossName)
		if (!fs.existsSync(bossFolderPath)) {
			console.warn(`Boss folder not found: ${bossName}`)
			return bossModelData
		}

		// Read the boss folder
		const folders = await fs.promises.readdir(bossFolderPath, { withFileTypes: true })

		for (const folder of folders) {
			if (!folder.isDirectory()) continue

			const folderPath = path.join(bossFolderPath, folder.name)
			const files = await fs.promises.readdir(folderPath)
			const fbxFile = files.find((file) => file.endsWith(".fbx"))

			if (!fbxFile) continue

			// Determine if this is a mesh or scene based on folder name
			if (folder.name.includes("_Mesh")) {
				// This is the boss mesh
				bossModelData.mesh = {
					name: `${bossName}_mesh`,
					path: `${bossName}/${folder.name}/${fbxFile}`,
					type: "body",
				}
			}
			// Skip battlefield scenes - they will be loaded through the scene selector
		}

		return bossModelData
	} catch (error) {
		console.error(`Error loading boss models for ${bossName}:`, error)
		return bossModelData
	}
}
