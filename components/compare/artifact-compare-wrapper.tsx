"use client"

import { useMemo, useCallback } from "react"
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
	const { isCompareMode, isHydrated } = useCompareMode()

	// Map of data by version
	const artifactDataMap: Record<DataVersion, ArtifactData | null> = useMemo(
		() => ({
			"cbt-phase-1": artifactDataCbtPhase1,
			"ccbt": artifactDataCcbt,
			"legacy": artifactDataLegacy,
		}),
		[artifactDataCbtPhase1, artifactDataCcbt, artifactDataLegacy],
	)

	// Render content for a specific version
	const renderVersionContent = useCallback(
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
		<CompareLayout availableVersions={availableVersions} renderContent={renderVersionContent}>
			<ArtifactClient artifactData={currentArtifactData} />
		</CompareLayout>
	)
}
