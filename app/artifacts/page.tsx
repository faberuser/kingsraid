import ArtifactsPageWrapper from "@/app/artifacts/page-wrapper"
import { ArtifactData } from "@/model/Artifact"
import { getData, getArtifactReleaseOrder, fetchAllVersions } from "@/lib/get-data"

export default async function ArtifactsPage() {
	// Fetch all independent data in parallel
	const [artifactsMap, releaseOrderMap] = await Promise.all([
		fetchAllVersions((v) => getData("artifacts", { dataVersion: v }) as Promise<ArtifactData[]>),
		fetchAllVersions((v) => getArtifactReleaseOrder(v)),
	])

	return <ArtifactsPageWrapper artifactsMap={artifactsMap} releaseOrderMap={releaseOrderMap} />
}
