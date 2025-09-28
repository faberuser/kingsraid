import fs from "fs"
import path from "path"
import ArtifactsClient from "@/app/artifacts/client"
import { ArtifactData } from "@/model/Artifact"

async function getArtifacts(): Promise<ArtifactData[]> {
	try {
		const artifactsFile = path.join(process.cwd(), "kingsraid-data", "table-data", "artifacts.json")

		if (!fs.existsSync(artifactsFile)) {
			return []
		}

		const fileContent = fs.readFileSync(artifactsFile, "utf-8")
		const artifactsData: ArtifactData[] = JSON.parse(fileContent)

		// Sort artifacts alphabetically by name
		return artifactsData.sort((a: ArtifactData, b: ArtifactData) => a.name.localeCompare(b.name))
	} catch (error) {
		console.error(error)
		return []
	}
}

export default async function ArtifactsPage() {
	const artifacts = await getArtifacts()

	return <ArtifactsClient artifacts={artifacts} />
}
