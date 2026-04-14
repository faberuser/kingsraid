import ArtifactsPageWrapper from "@/app/artifacts/page-wrapper"
import { ArtifactData } from "@/model/Artifact"
import { getData, getArtifactReleaseOrder, fetchAllVersions } from "@/lib/get-data"

export default async function ArtifactsPage() {
	// Fetch all independent data in parallel (Rule 1.5: Promise.all for independent operations)
	const [artifactsMap, releaseOrderMap] = await Promise.all([
		fetchAllVersions((v) => getData("artifacts", { dataVersion: v }) as Promise<ArtifactData[]>),
		fetchAllVersions((v) => getArtifactReleaseOrder(v)),
	])

	return <ArtifactsPageWrapper artifactsMap={artifactsMap} releaseOrderMap={releaseOrderMap} />
}
