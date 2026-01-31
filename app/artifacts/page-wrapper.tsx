"use client"

import { ArtifactData } from "@/model/Artifact"
import ArtifactsClient from "@/app/artifacts/client"
import { useDataVersion, DataVersion } from "@/hooks/use-data-version"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"

interface ArtifactsPageWrapperProps {
	artifactsCbtPhase1: ArtifactData[]
	artifactsCcbt: ArtifactData[]
	artifactsLegacy: ArtifactData[]
	releaseOrderCbtPhase1: Record<string, string>
	releaseOrderCcbt: Record<string, string>
	releaseOrderLegacy: Record<string, string>
}

export default function ArtifactsPageWrapper({
	artifactsCbtPhase1,
	artifactsCcbt,
	artifactsLegacy,
	releaseOrderCbtPhase1,
	releaseOrderCcbt,
	releaseOrderLegacy,
}: ArtifactsPageWrapperProps) {
	const { version, isHydrated } = useDataVersion()
	const { setShowToggle, setAvailableVersions } = useHeroToggle()

	useEffect(() => {
		setShowToggle(true)
		setAvailableVersions(["cbt-phase-1", "ccbt", "legacy"])
		return () => setShowToggle(false)
	}, [setShowToggle, setAvailableVersions])

	const artifactsMap: Record<DataVersion, ArtifactData[]> = useMemo(
		() => ({
			"cbt-phase-1": artifactsCbtPhase1,
			"ccbt": artifactsCcbt,
			"legacy": artifactsLegacy,
		}),
		[artifactsCbtPhase1, artifactsCcbt, artifactsLegacy],
	)

	const releaseOrderMap: Record<DataVersion, Record<string, string>> = useMemo(
		() => ({
			"cbt-phase-1": releaseOrderCbtPhase1,
			"ccbt": releaseOrderCcbt,
			"legacy": releaseOrderLegacy,
		}),
		[releaseOrderCbtPhase1, releaseOrderCcbt, releaseOrderLegacy],
	)

	const artifacts = artifactsMap[version]
	const releaseOrder = releaseOrderMap[version]

	// Show loading spinner until hydrated
	if (!isHydrated) {
		return (
			<div className="flex items-center justify-center h-96">
				<Spinner className="h-8 w-8" />
			</div>
		)
	}

	return <ArtifactsClient artifacts={artifacts} releaseOrder={releaseOrder} />
}
