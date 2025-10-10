import ArtifactsClient from "@/app/artifacts/client"
import { ArtifactData } from "@/model/Artifact"
import { getData } from "@/lib/get-data"

export default async function ArtifactsPage() {
	const artifacts = (await getData("artifacts.json")) as ArtifactData[]

	return <ArtifactsClient artifacts={artifacts} />
}
