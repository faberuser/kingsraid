import ArtifactsPageWrapper from "@/app/artifacts/page-wrapper"
import { ArtifactData } from "@/model/Artifact"
import { getData, getArtifactReleaseOrder } from "@/lib/get-data"

export default async function ArtifactsPage() {
	// Fetch artifacts data for all three versions
	const artifactsCbtPhase1 = (await getData("artifacts", { dataVersion: "cbt-phase-1" })) as ArtifactData[]
	const artifactsCcbt = (await getData("artifacts", { dataVersion: "ccbt" })) as ArtifactData[]
	const artifactsLegacy = (await getData("artifacts", { dataVersion: "legacy" })) as ArtifactData[]

	// Fetch release order for all three versions
	const releaseOrderCbtPhase1 = await getArtifactReleaseOrder("cbt-phase-1")
	const releaseOrderCcbt = await getArtifactReleaseOrder("ccbt")
	const releaseOrderLegacy = await getArtifactReleaseOrder("legacy")

	return (
		<ArtifactsPageWrapper
			artifactsCbtPhase1={artifactsCbtPhase1}
			artifactsCcbt={artifactsCcbt}
			artifactsLegacy={artifactsLegacy}
			releaseOrderCbtPhase1={releaseOrderCbtPhase1}
			releaseOrderCcbt={releaseOrderCcbt}
			releaseOrderLegacy={releaseOrderLegacy}
		/>
	)
}
