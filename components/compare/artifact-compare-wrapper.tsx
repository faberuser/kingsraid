"use client"

import { useCallback } from "react"
import ArtifactClient from "@/app/artifacts/[...slug]/client"
import { ArtifactData } from "@/model/Artifact"
import { DataVersion } from "@/lib/constants"
import { useCompareMode } from "@/hooks/use-compare-mode"
import { CompareLayout } from "@/components/compare"

interface ArtifactCompareWrapperProps {
	artifactsMap: Record<DataVersion, ArtifactData | null>
	availableVersions: DataVersion[]
	currentArtifactData: ArtifactData
}

export default function ArtifactCompareWrapper({
	artifactsMap,
	availableVersions,
	currentArtifactData,
}: ArtifactCompareWrapperProps) {
	const { isCompareMode, isHydrated } = useCompareMode()

	// Map of data by version
	const artifactDataMap = artifactsMap

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
