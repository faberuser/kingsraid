import fs from "fs"
import path from "path"

export async function getAvailableScenes(): Promise<Array<{ value: string; label: string }>> {
	const scenesDir = path.join(process.cwd(), "public", "kingsraid-models", "scenes")
	const scenes: Array<{ value: string; label: string }> = [{ value: "grid", label: "Grid" }]

	try {
		if (fs.existsSync(scenesDir)) {
			const folders = fs.readdirSync(scenesDir, { withFileTypes: true })
			const sceneFolders = folders
				.filter((dirent) => dirent.isDirectory())
				.map((dirent) => dirent.name)
				.sort()

			for (const folderName of sceneFolders) {
				// Convert folder names to readable labels
				const label = folderName
					.replace(/([A-Z])/g, " $1")
					.trim()
					.replace(/^./, (str) => str.toUpperCase())

				scenes.push({
					value: folderName,
					label: label,
				})
			}
		}
	} catch (error) {
		console.error("Error reading scenes directory:", error)
	}

	return scenes
}
