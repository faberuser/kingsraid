"use client"

import { ArtifactData } from "@/model/Artifact"
import ArtifactsClient from "@/app/artifacts/client"
import { useHeroDataVersion, HeroDataVersion } from "@/hooks/use-hero-data-version"
import { useHeroToggle } from "@/contexts/hero-toggle-context"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"

interface ArtifactsPageWrapperProps {
	artifactsCbt: ArtifactData[]
	artifactsCcbt: ArtifactData[]
	artifactsLegacy: ArtifactData[]
	releaseOrderCbt: Record<string, string>
	releaseOrderCcbt: Record<string, string>
	releaseOrderLegacy: Record<string, string>
}

export default function ArtifactsPageWrapper({
	artifactsCbt,
	artifactsCcbt,
	artifactsLegacy,
	releaseOrderCbt,
	releaseOrderCcbt,
	releaseOrderLegacy,
}: ArtifactsPageWrapperProps) {
	const { version, isHydrated } = useHeroDataVersion()
	const { setShowToggle } = useHeroToggle()

	useEffect(() => {
		setShowToggle(true)
		return () => setShowToggle(false)
	}, [setShowToggle])

	const artifactsMap: Record<HeroDataVersion, ArtifactData[]> = useMemo(
		() => ({
			cbt: artifactsCbt,
			ccbt: artifactsCcbt,
			legacy: artifactsLegacy,
		}),
		[artifactsCbt, artifactsCcbt, artifactsLegacy],
	)

	const releaseOrderMap: Record<HeroDataVersion, Record<string, string>> = useMemo(
		() => ({
			cbt: releaseOrderCbt,
			ccbt: releaseOrderCcbt,
			legacy: releaseOrderLegacy,
		}),
		[releaseOrderCbt, releaseOrderCcbt, releaseOrderLegacy],
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
