"use client"

import ArtifactClient from "@/app/artifacts/[...slug]/client"
import { ArtifactData } from "@/model/Artifact"
import { useDataVersion, DataVersion } from "@/hooks/use-data-version"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"

interface ArtifactPageWrapperProps {
	artifactDataCbt: ArtifactData | null
	artifactDataCcbt: ArtifactData | null
	artifactDataLegacy: ArtifactData
}

export default function ArtifactPageWrapper({
	artifactDataCbt,
	artifactDataCcbt,
	artifactDataLegacy,
}: ArtifactPageWrapperProps) {
	const { version, setVersion, isHydrated } = useDataVersion()
	const { setShowToggle } = useHeroToggle()

	// Check which versions have data for this artifact
	const artifactExistsInCbt = artifactDataCbt !== null
	const artifactExistsInCcbt = artifactDataCcbt !== null

	// Map of artifact data by version
	const artifactDataMap: Record<DataVersion, ArtifactData | null> = useMemo(
		() => ({
			cbt: artifactDataCbt,
			ccbt: artifactDataCcbt,
			legacy: artifactDataLegacy,
		}),
		[artifactDataCbt, artifactDataCcbt, artifactDataLegacy],
	)

	// Show toggle only if artifact exists in at least one non-legacy version
	const showVersionToggle = artifactExistsInCbt || artifactExistsInCcbt

	useEffect(() => {
		setShowToggle(showVersionToggle)
		return () => setShowToggle(false)
	}, [showVersionToggle, setShowToggle])

	useEffect(() => {
		// If user selects a version that doesn't have this artifact, fallback to legacy
		if (version === "cbt" && !artifactExistsInCbt) {
			if (artifactExistsInCcbt) {
				setVersion("ccbt")
			} else {
				setVersion("legacy")
			}
		} else if (version === "ccbt" && !artifactExistsInCcbt) {
			if (artifactExistsInCbt) {
				setVersion("cbt")
			} else {
				setVersion("legacy")
			}
		}
	}, [version, artifactExistsInCbt, artifactExistsInCcbt, setVersion])

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

	return <ArtifactClient artifactData={artifactData} />
}
