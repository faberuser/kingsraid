"use client"

import BossClient from "@/app/bosses/[...slug]/client"
import { BossData } from "@/model/Boss"
import { ModelFile } from "@/model/Hero_Model"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useEffect, useMemo } from "react"
import { DataVersion } from "@/hooks/use-data-version"

// Boss models are now organized by variant (similar to hero costumes)
type BossModelData = Record<string, ModelFile[]>

interface BossPageWrapperProps {
	bossData: BossData
	bossModels?: BossModelData
	bossScenes?: Array<{ value: string; label: string }>
	enableModelsVoices?: boolean
	existsInCbtPhase1?: boolean
	existsInCcbt?: boolean
}

export default function BossPageWrapper({
	bossData,
	bossModels,
	bossScenes = [],
	enableModelsVoices = false,
	existsInCbtPhase1 = false,
	existsInCcbt = false,
}: BossPageWrapperProps) {
	const { setShowToggle, setAvailableVersions } = useHeroToggle()

	// Show toggle only if boss exists in at least one non-legacy version
	const showVersionToggle = existsInCbtPhase1 || existsInCcbt

	// Determine available versions for this boss
	const availableVersions = useMemo(() => {
		const versions: DataVersion[] = []
		if (existsInCbtPhase1) versions.push("cbt-phase-1")
		if (existsInCcbt) versions.push("ccbt")
		versions.push("legacy")
		return versions
	}, [existsInCbtPhase1, existsInCcbt])

	// Enable version toggle on mount - only if boss exists in other versions
	useEffect(() => {
		setAvailableVersions(availableVersions)
		setShowToggle(showVersionToggle)
		return () => setShowToggle(false)
	}, [setAvailableVersions, setShowToggle, availableVersions, showVersionToggle])

	return (
		<BossClient
			bossData={bossData}
			bossModels={bossModels}
			bossScenes={bossScenes}
			enableModelsVoices={enableModelsVoices}
		/>
	)
}
