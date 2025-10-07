import ArtifactsClient from "@/app/artifacts/client"
import { ArtifactData } from "@/model/Artifact"
import { getArtifactsData } from "@/components/server/get-data"

export default async function ArtifactsPage() {
	const artifacts = (await getArtifactsData("artifacts.json")) as ArtifactData[]

	return <ArtifactsClient artifacts={artifacts} />
}
