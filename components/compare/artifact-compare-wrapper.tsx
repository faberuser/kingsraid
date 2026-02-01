"use client"

import { useMemo } from "react"
import ArtifactClient from "@/app/artifacts/[...slug]/client"
import { ArtifactData } from "@/model/Artifact"
import { DataVersion } from "@/hooks/use-data-version"
import { useCompareMode } from "@/hooks/use-compare-mode"
import { CompareLayout } from "@/components/compare"

interface ArtifactCompareWrapperProps {
	artifactDataCbtPhase1: ArtifactData | null
	artifactDataCcbt: ArtifactData | null
	artifactDataLegacy: ArtifactData
	availableVersions: DataVersion[]
	currentArtifactData: ArtifactData
}

export default function ArtifactCompareWrapper({
	artifactDataCbtPhase1,
	artifactDataCcbt,
	artifactDataLegacy,
	availableVersions,
	currentArtifactData,
}: ArtifactCompareWrapperProps) {
	const { leftVersion, rightVersion, isCompareMode, isHydrated } = useCompareMode()

	// Map of data by version
	const artifactDataMap: Record<DataVersion, ArtifactData | null> = useMemo(
		() => ({
			"cbt-phase-1": artifactDataCbtPhase1,
			"ccbt": artifactDataCcbt,
			"legacy": artifactDataLegacy,
		}),
		[artifactDataCbtPhase1, artifactDataCcbt, artifactDataLegacy],
	)

	if (!isHydrated || !isCompareMode) {
		return <ArtifactClient artifactData={currentArtifactData} />
	}

	const leftData = artifactDataMap[leftVersion] || artifactDataLegacy
	const rightData = artifactDataMap[rightVersion] || artifactDataLegacy

	return (
		<CompareLayout
			availableVersions={availableVersions}
			leftContent={artifactDataMap[leftVersion] ? <ArtifactClient artifactData={leftData} /> : null}
			rightContent={artifactDataMap[rightVersion] ? <ArtifactClient artifactData={rightData} /> : null}
		>
			<ArtifactClient artifactData={currentArtifactData} />
		</CompareLayout>
	)
}
