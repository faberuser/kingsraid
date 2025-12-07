import ArtifactsClient from "@/app/artifacts/client"
import { ArtifactData } from "@/model/Artifact"
import { getData, getJsonData } from "@/lib/get-data"

export default async function ArtifactsPage() {
	const artifacts = (await getData("artifacts.json")) as ArtifactData[]
	const releaseOrder = await getJsonData("table-data/artifact_release_order.json")

	return <ArtifactsClient artifacts={artifacts} releaseOrder={releaseOrder} />
}
