import ArtifactsPageWrapper from "@/app/artifacts/page-wrapper"
import { ArtifactData } from "@/model/Artifact"
import { getData, getArtifactReleaseOrder, fetchAllVersions } from "@/lib/get-data"

export default async function ArtifactsPage() {
	// Fetch artifacts data for all versions
	const artifactsMap = await fetchAllVersions(
		(v) => getData("artifacts", { dataVersion: v }) as Promise<ArtifactData[]>,
	)

	// Fetch release order for all versions
	const releaseOrderMap = await fetchAllVersions((v) => getArtifactReleaseOrder(v))

	return <ArtifactsPageWrapper artifactsMap={artifactsMap} releaseOrderMap={releaseOrderMap} />
}
