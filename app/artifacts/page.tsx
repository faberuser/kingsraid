import ArtifactsClient from "@/app/artifacts/client"
import { ArtifactData } from "@/model/Artifact"
import { getJsonDataList } from "@/components/server/get-data"

export default async function ArtifactsPage() {
	const artifacts = (await getJsonDataList("artifacts.json")) as ArtifactData[]

	return <ArtifactsClient artifacts={artifacts} />
}
