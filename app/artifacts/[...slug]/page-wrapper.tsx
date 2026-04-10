"use client"

import ArtifactCompareWrapper from "@/components/compare/artifact-compare-wrapper"
import { ArtifactData } from "@/model/Artifact"
import { useDataVersion } from "@/hooks/use-data-version"
import { DataVersion, DATA_VERSIONS } from "@/lib/constants"
import { useEnableVersionToggle } from "@/contexts/version-toggle-context"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"

interface ArtifactPageWrapperProps {
	artifactsMap: Record<DataVersion, ArtifactData | null>
}

export default function ArtifactPageWrapper({ artifactsMap }: ArtifactPageWrapperProps) {
	const { version, setVersion, isHydrated } = useDataVersion()

	// Map of artifact data by version
	const artifactDataMap = artifactsMap

	// Determine available versions for this artifact
	const availableVersions = useMemo(() => {
		return DATA_VERSIONS.filter((v) => artifactDataMap[v] !== null)
	}, [artifactDataMap])

	const showVersionToggle = availableVersions.length > 1

	useEnableVersionToggle(availableVersions, showVersionToggle)

	useEffect(() => {
		// If user selects a version that doesn't have this artifact, fallback to first available
		if (!artifactDataMap[version] && availableVersions.length > 0) {
			setVersion(availableVersions[0])
		}
	}, [version, artifactDataMap, availableVersions, setVersion])

	// Show loading while hydrating
	if (!isHydrated) {
		return (
			<div className="flex items-center justify-center h-96">
				<Spinner className="h-8 w-8" />
			</div>
		)
	}

	// Get the data for the current version, fallback to legacy if not available, or first available
	const artifactData = artifactDataMap[version] || artifactDataMap.legacy || artifactDataMap[availableVersions[0]]

	if (!artifactData) return null

	return (
		<ArtifactCompareWrapper
			artifactsMap={artifactDataMap}
			availableVersions={availableVersions}
			currentArtifactData={artifactData}
		/>
	)
}
