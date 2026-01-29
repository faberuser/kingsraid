"use client"

import HeroClient from "@/app/heroes/[...slug]/client"
import { HeroData } from "@/model/Hero"
import { Costume, ModelFile } from "@/model/Hero_Model"
import { VoiceFiles } from "@/components/heroes/voices"
import { useHeroDataVersion, HeroDataVersion } from "@/hooks/use-hero-data-version"
import { useHeroToggle } from "@/contexts/hero-toggle-context"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"

interface HeroPageWrapperProps {
	heroDataCbt: HeroData | null
	heroDataCcbt: HeroData | null
	heroDataLegacy: HeroData
	costumesCbt: Costume[]
	costumesCcbt: Costume[]
	costumesLegacy: Costume[]
	heroModelsCbt: { [costume: string]: ModelFile[] }
	heroModelsCcbt: { [costume: string]: ModelFile[] }
	heroModelsLegacy: { [costume: string]: ModelFile[] }
	voiceFilesCbt: VoiceFiles
	voiceFilesCcbt: VoiceFiles
	voiceFilesLegacy: VoiceFiles
	availableScenes?: Array<{ value: string; label: string }>
	enableModelsVoices?: boolean
}

export default function HeroPageWrapper({
	heroDataCbt,
	heroDataCcbt,
	heroDataLegacy,
	costumesCbt,
	costumesCcbt,
	costumesLegacy,
	heroModelsCbt,
	heroModelsCcbt,
	heroModelsLegacy,
	voiceFilesCbt,
	voiceFilesCcbt,
	voiceFilesLegacy,
	availableScenes = [],
	enableModelsVoices = false,
}: HeroPageWrapperProps) {
	const { version, setVersion, isHydrated } = useHeroDataVersion()
	const { setShowToggle } = useHeroToggle()

	// Check which versions have data for this hero
	const heroExistsInCbt = heroDataCbt !== null
	const heroExistsInCcbt = heroDataCcbt !== null

	// Map of hero data by version
	const heroDataMap: Record<HeroDataVersion, HeroData | null> = useMemo(
		() => ({
			cbt: heroDataCbt,
			ccbt: heroDataCcbt,
			legacy: heroDataLegacy,
		}),
		[heroDataCbt, heroDataCcbt, heroDataLegacy],
	)

	const costumesMap: Record<HeroDataVersion, Costume[]> = useMemo(
		() => ({
			cbt: costumesCbt,
			ccbt: costumesCcbt,
			legacy: costumesLegacy,
		}),
		[costumesCbt, costumesCcbt, costumesLegacy],
	)

	const heroModelsMap: Record<HeroDataVersion, { [costume: string]: ModelFile[] }> = useMemo(
		() => ({
			cbt: heroModelsCbt,
			ccbt: heroModelsCcbt,
			legacy: heroModelsLegacy,
		}),
		[heroModelsCbt, heroModelsCcbt, heroModelsLegacy],
	)

	const voiceFilesMap: Record<HeroDataVersion, VoiceFiles> = useMemo(
		() => ({
			cbt: voiceFilesCbt,
			ccbt: voiceFilesCcbt,
			legacy: voiceFilesLegacy,
		}),
		[voiceFilesCbt, voiceFilesCcbt, voiceFilesLegacy],
	)

	// Show toggle only if hero exists in at least one non-legacy version
	const showVersionToggle = heroExistsInCbt || heroExistsInCcbt

	useEffect(() => {
		setShowToggle(showVersionToggle)
		return () => setShowToggle(false)
	}, [showVersionToggle, setShowToggle])

	useEffect(() => {
		// If user selects a version that doesn't have this hero, fallback to legacy
		if (version === "cbt" && !heroExistsInCbt) {
			if (heroExistsInCcbt) {
				setVersion("ccbt")
			} else {
				setVersion("legacy")
			}
		} else if (version === "ccbt" && !heroExistsInCcbt) {
			if (heroExistsInCbt) {
				setVersion("cbt")
			} else {
				setVersion("legacy")
			}
		}
	}, [version, heroExistsInCbt, heroExistsInCcbt, setVersion])

	// Show loading while hydrating
	if (!isHydrated) {
		return (
			<div className="flex items-center justify-center h-96">
				<Spinner className="h-8 w-8" />
			</div>
		)
	}

	// Get the data for the current version, fallback to legacy if not available
	const heroData = heroDataMap[version] || heroDataLegacy
	const costumes = costumesMap[version].length > 0 ? costumesMap[version] : costumesLegacy
	const heroModels = Object.keys(heroModelsMap[version]).length > 0 ? heroModelsMap[version] : heroModelsLegacy
	const voiceFiles =
		voiceFilesMap[version].en.length > 0 ||
		voiceFilesMap[version].jp.length > 0 ||
		voiceFilesMap[version].kr.length > 0
			? voiceFilesMap[version]
			: voiceFilesLegacy

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
