"use client"

import ArtifactCompareWrapper from "@/components/compare/artifact-compare-wrapper"
import { ArtifactData } from "@/model/Artifact"
import { useDataVersion, DataVersion } from "@/hooks/use-data-version"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"

interface ArtifactPageWrapperProps {
	artifactDataCbtPhase1: ArtifactData | null
	artifactDataCcbt: ArtifactData | null
	artifactDataLegacy: ArtifactData
}

export default function ArtifactPageWrapper({
	artifactDataCbtPhase1,
	artifactDataCcbt,
	artifactDataLegacy,
}: ArtifactPageWrapperProps) {
	const { version, setVersion, isHydrated } = useDataVersion()
	const { setShowToggle, setAvailableVersions } = useHeroToggle()

	// Check which versions have data for this artifact
	const artifactExistsInCbtPhase1 = artifactDataCbtPhase1 !== null
	const artifactExistsInCcbt = artifactDataCcbt !== null

	// Map of artifact data by version
	const artifactDataMap: Record<DataVersion, ArtifactData | null> = useMemo(
		() => ({
			"cbt-phase-1": artifactDataCbtPhase1,
			"ccbt": artifactDataCcbt,
			"legacy": artifactDataLegacy,
		}),
		[artifactDataCbtPhase1, artifactDataCcbt, artifactDataLegacy],
	)

	// Show toggle only if artifact exists in at least one non-legacy version
	const showVersionToggle = artifactExistsInCbtPhase1 || artifactExistsInCcbt

	// Determine available versions for this artifact
	const availableVersions = useMemo(() => {
		const versions: DataVersion[] = []
		if (artifactExistsInCbtPhase1) versions.push("cbt-phase-1")
		if (artifactExistsInCcbt) versions.push("ccbt")
		versions.push("legacy")
		return versions
	}, [artifactExistsInCbtPhase1, artifactExistsInCcbt])

	useEffect(() => {
		setShowToggle(showVersionToggle)
		setAvailableVersions(availableVersions)
		return () => setShowToggle(false)
	}, [showVersionToggle, setShowToggle, setAvailableVersions, availableVersions])

	useEffect(() => {
		// If user selects a version that doesn't have this artifact, fallback to legacy
		if (version === "cbt-phase-1" && !artifactExistsInCbtPhase1) {
			if (artifactExistsInCcbt) {
				setVersion("ccbt")
			} else {
				setVersion("legacy")
			}
		} else if (version === "ccbt" && !artifactExistsInCcbt) {
			if (artifactExistsInCbtPhase1) {
				setVersion("cbt-phase-1")
			} else {
				setVersion("legacy")
			}
		}
	}, [version, artifactExistsInCbtPhase1, artifactExistsInCcbt, setVersion])

	// Show loading while hydrating
	if (!isHydrated) {
		return (
			<div className="flex items-center justify-center h-96">
				<Spinner className="h-8 w-8" />
			</div>
		)
	}

	// Get the data for the current version, fallback to legacy if not available
	const artifactData = artifactDataMap[version] || artifactDataLegacy

	return (
		<ArtifactCompareWrapper
			artifactDataCbtPhase1={artifactDataCbtPhase1}
			artifactDataCcbt={artifactDataCcbt}
			artifactDataLegacy={artifactDataLegacy}
			availableVersions={availableVersions}
			currentArtifactData={artifactData}
		/>
	)
}
