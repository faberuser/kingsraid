import fs from "fs"
import path from "path"
import ArtifactsClient from "@/app/artifacts/client"
import { ArtifactData } from "@/model/Artifact"

interface ArtifactsData {
	[artifactName: string]: ArtifactData
}

async function getArtifacts(): Promise<{ name: string; data: ArtifactData }[]> {
	try {
		const artifactsFile = path.join(process.cwd(), "kingsraid-data", "table-data", "artifacts.json")

		if (!fs.existsSync(artifactsFile)) {
			return []
		}

		const fileContent = fs.readFileSync(artifactsFile, "utf-8")
		const artifactsData: ArtifactsData = JSON.parse(fileContent)

		// Convert to array format with name included
		const artifacts = Object.entries(artifactsData).map(([name, data]) => ({
			name,
			data,
		}))

		// Sort artifacts alphabetically by name
		return artifacts.sort((a, b) => a.name.localeCompare(b.name))
	} catch (error) {
		console.error("Error reading artifacts data:", error)
		return []
	}
}

export default async function ArtifactsPage() {
	const artifacts = await getArtifacts()

	return <ArtifactsClient artifacts={artifacts} />
}
