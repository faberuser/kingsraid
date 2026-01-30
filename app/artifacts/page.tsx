import ArtifactsPageWrapper from "@/app/artifacts/page-wrapper"
import { ArtifactData } from "@/model/Artifact"
import { getData, getArtifactReleaseOrder } from "@/lib/get-data"

export default async function ArtifactsPage() {
	// Fetch artifacts data for all three versions
	const artifactsCbt = (await getData("artifacts", { dataVersion: "cbt" })) as ArtifactData[]
	const artifactsCcbt = (await getData("artifacts", { dataVersion: "ccbt" })) as ArtifactData[]
	const artifactsLegacy = (await getData("artifacts", { dataVersion: "legacy" })) as ArtifactData[]

	// Fetch release order for all three versions
	const releaseOrderCbt = await getArtifactReleaseOrder("cbt")
	const releaseOrderCcbt = await getArtifactReleaseOrder("ccbt")
	const releaseOrderLegacy = await getArtifactReleaseOrder("legacy")

	return (
		<ArtifactsPageWrapper
			artifactsCbt={artifactsCbt}
			artifactsCcbt={artifactsCcbt}
			artifactsLegacy={artifactsLegacy}
			releaseOrderCbt={releaseOrderCbt}
			releaseOrderCcbt={releaseOrderCcbt}
			releaseOrderLegacy={releaseOrderLegacy}
		/>
	)
}
