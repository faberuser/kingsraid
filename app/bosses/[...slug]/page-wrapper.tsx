"use client"

import BossClient from "@/app/bosses/[...slug]/client"
import { BossData } from "@/model/Boss"
import { ModelFile } from "@/model/Hero_Model"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useEffect } from "react"

// Boss models are now organized by variant (similar to hero costumes)
type BossModelData = Record<string, ModelFile[]>

interface BossPageWrapperProps {
	bossData: BossData
	bossModels?: BossModelData
	bossScenes?: Array<{ value: string; label: string }>
	enableModelsVoices?: boolean
}

export default function BossPageWrapper({
	bossData,
	bossModels,
	bossScenes = [],
	enableModelsVoices = false,
}: BossPageWrapperProps) {
	const { setShowToggle, setAvailableVersions } = useHeroToggle()

	// Enable version toggle on mount - all versions available
	useEffect(() => {
		setAvailableVersions(["cbt-phase-1", "ccbt", "legacy"])
		setShowToggle(true)
		return () => setShowToggle(false)
	}, [setAvailableVersions, setShowToggle])

	return (
		<BossClient
			bossData={bossData}
			bossModels={bossModels}
			bossScenes={bossScenes}
			enableModelsVoices={enableModelsVoices}
		/>
	)
}
