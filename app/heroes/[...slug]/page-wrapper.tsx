"use client"

import HeroClient from "@/app/heroes/[...slug]/client"
import { HeroData } from "@/model/Hero"
import { Costume, ModelFile } from "@/model/Hero_Model"
import { VoiceFiles } from "@/components/heroes/voices"
import { useHeroDataVersion } from "@/hooks/use-hero-data-version"
import { useHeroToggle } from "@/contexts/hero-toggle-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

interface HeroPageWrapperProps {
	heroDataLegacy: HeroData | null
	heroDataNew: HeroData | null
	costumesLegacy: Costume[]
	costumesNew: Costume[]
	heroModelsLegacy: { [costume: string]: ModelFile[] }
	heroModelsNew: { [costume: string]: ModelFile[] }
	voiceFilesLegacy: VoiceFiles
	voiceFilesNew: VoiceFiles
	availableScenes?: Array<{ value: string; label: string }>
	enableModelsVoices?: boolean
}

export default function HeroPageWrapper({
	heroDataLegacy,
	heroDataNew,
	costumesLegacy,
	costumesNew,
	heroModelsLegacy,
	heroModelsNew,
	voiceFilesLegacy,
	voiceFilesNew,
	availableScenes = [],
	enableModelsVoices = false,
}: HeroPageWrapperProps) {
	const { isNew, isHydrated } = useHeroDataVersion()
	const { setShowToggle } = useHeroToggle()
	const router = useRouter()

	// Check if hero exists in new data
	const heroExistsInNewData = heroDataNew !== null

	useEffect(() => {
		// Show toggle only if hero exists in new data
		setShowToggle(heroExistsInNewData)
		return () => setShowToggle(false)
	}, [heroExistsInNewData, setShowToggle])

	useEffect(() => {
		// If user switches to new data but hero doesn't exist there, redirect to heroes list
		if (isNew && !heroExistsInNewData) {
			router.push("/heroes")
		}
	}, [isNew, heroExistsInNewData, router])

	// Show loading while hydrating or navigating away
	if (!isHydrated || (isNew && !heroExistsInNewData)) {
		return (
			<div className="flex items-center justify-center h-96">
				<Spinner className="h-8 w-8" />
			</div>
		)
	}

	const heroData = isNew && heroDataNew ? heroDataNew : heroDataLegacy!
	const costumes = isNew && heroDataNew ? costumesNew : costumesLegacy
	const heroModels = isNew && heroDataNew ? heroModelsNew : heroModelsLegacy
	const voiceFiles = isNew && heroDataNew ? voiceFilesNew : voiceFilesLegacy

	return (
		<HeroClient
			heroData={heroData}
			costumes={costumes}
			heroModels={heroModels}
			voiceFiles={voiceFiles}
			availableScenes={availableScenes}
			enableModelsVoices={enableModelsVoices}
		/>
	)
}
