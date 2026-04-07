"use client"

import { useMemo, useCallback } from "react"
import ArtifactClient from "@/app/artifacts/[...slug]/client"
import { ArtifactData } from "@/model/Artifact"
import { DataVersion } from "@/hooks/use-data-version"
import { useCompareMode } from "@/hooks/use-compare-mode"
import { CompareLayout } from "@/components/compare"

interface ArtifactCompareWrapperProps {
	artifactDataCbtPhase2: ArtifactData | null
	artifactDataCbtPhase1: ArtifactData | null
	artifactDataCcbt: ArtifactData | null
	artifactDataLegacy: ArtifactData
	availableVersions: DataVersion[]
	currentArtifactData: ArtifactData
}

export default function ArtifactCompareWrapper({
	artifactDataCbtPhase2,
	artifactDataCbtPhase1,
	artifactDataCcbt,
	artifactDataLegacy,
	availableVersions,
	currentArtifactData,
}: ArtifactCompareWrapperProps) {
	const { isCompareMode, isHydrated } = useCompareMode()

	// Map of data by version
	const artifactDataMap: Record<DataVersion, ArtifactData | null> = useMemo(
		() => ({
			"cbt-phase-2": artifactDataCbtPhase2,
			"cbt-phase-1": artifactDataCbtPhase1,
			"ccbt": artifactDataCcbt,
			"legacy": artifactDataLegacy,
		}),
		[artifactDataCbtPhase2, artifactDataCbtPhase1, artifactDataCcbt, artifactDataLegacy],
	)

	const getCompareData = useCallback(
		(version: DataVersion) => {
			const data = artifactDataMap[version]
			if (!data) {
				return null
			}
			return <ArtifactClient artifactData={data} />
		},
		[artifactDataMap],
	)

	if (!isHydrated || !isCompareMode) {
		return <ArtifactClient artifactData={currentArtifactData} />
	}

	return (
		<CompareLayout availableVersions={availableVersions} renderContent={getCompareData}>
			<ArtifactClient artifactData={currentArtifactData} />
		</CompareLayout>
	)
}
