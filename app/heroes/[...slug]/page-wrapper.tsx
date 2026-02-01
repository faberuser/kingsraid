"use client"

import HeroClient from "@/app/heroes/[...slug]/client"
import { HeroData } from "@/model/Hero"
import { Costume, ModelFile } from "@/model/Hero_Model"
import { VoiceFiles } from "@/components/heroes/voices"
import { useDataVersion, DataVersion } from "@/hooks/use-data-version"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"
import { ClassPerksData } from "@/components/heroes/perks"

interface HeroPageWrapperProps {
	heroDataCbtPhase1: HeroData | null
	heroDataCcbt: HeroData | null
	heroDataLegacy: HeroData
	costumesCbtPhase1: Costume[]
	costumesCcbt: Costume[]
	costumesLegacy: Costume[]
	heroModelsCbtPhase1: { [costume: string]: ModelFile[] }
	heroModelsCcbt: { [costume: string]: ModelFile[] }
	heroModelsLegacy: { [costume: string]: ModelFile[] }
	voiceFilesCbtPhase1: VoiceFiles
	voiceFilesCcbt: VoiceFiles
	voiceFilesLegacy: VoiceFiles
	availableScenes?: Array<{ value: string; label: string }>
	enableModelsVoices?: boolean
	classPerksLegacy: ClassPerksData
	classPerksCbtPhase1: ClassPerksData
	classPerksCcbt: ClassPerksData
}

export default function HeroPageWrapper({
	heroDataCbtPhase1,
	heroDataCcbt,
	heroDataLegacy,
	costumesCbtPhase1,
	costumesCcbt,
	costumesLegacy,
	heroModelsCbtPhase1,
	heroModelsCcbt,
	heroModelsLegacy,
	voiceFilesCbtPhase1,
	voiceFilesCcbt,
	voiceFilesLegacy,
	availableScenes = [],
	enableModelsVoices = false,
	classPerksLegacy,
	classPerksCbtPhase1,
	classPerksCcbt,
}: HeroPageWrapperProps) {
	const { version, setVersion, isHydrated } = useDataVersion()
	const { setShowToggle, setAvailableVersions } = useHeroToggle()

	// Check which versions have data for this hero
	const heroExistsInCbtPhase1 = heroDataCbtPhase1 !== null
	const heroExistsInCcbt = heroDataCcbt !== null

	// Map of hero data by version
	const heroDataMap: Record<DataVersion, HeroData | null> = useMemo(
		() => ({
			"cbt-phase-1": heroDataCbtPhase1,
			"ccbt": heroDataCcbt,
			"legacy": heroDataLegacy,
		}),
		[heroDataCbtPhase1, heroDataCcbt, heroDataLegacy],
	)

	const costumesMap: Record<DataVersion, Costume[]> = useMemo(
		() => ({
			"cbt-phase-1": costumesCbtPhase1,
			"ccbt": costumesCcbt,
			"legacy": costumesLegacy,
		}),
		[costumesCbtPhase1, costumesCcbt, costumesLegacy],
	)

	const heroModelsMap: Record<DataVersion, { [costume: string]: ModelFile[] }> = useMemo(
		() => ({
			"cbt-phase-1": heroModelsCbtPhase1,
			"ccbt": heroModelsCcbt,
			"legacy": heroModelsLegacy,
		}),
		[heroModelsCbtPhase1, heroModelsCcbt, heroModelsLegacy],
	)

	const voiceFilesMap: Record<DataVersion, VoiceFiles> = useMemo(
		() => ({
			"cbt-phase-1": voiceFilesCbtPhase1,
			"ccbt": voiceFilesCcbt,
			"legacy": voiceFilesLegacy,
		}),
		[voiceFilesCbtPhase1, voiceFilesCcbt, voiceFilesLegacy],
	)

	const classPerksMap: Record<DataVersion, ClassPerksData> = useMemo(
		() => ({
			"cbt-phase-1": classPerksCbtPhase1,
			"ccbt": classPerksCcbt,
			"legacy": classPerksLegacy,
		}),
		[classPerksCbtPhase1, classPerksCcbt, classPerksLegacy],
	)

	// Show toggle only if hero exists in at least one non-legacy version
	const showVersionToggle = heroExistsInCbtPhase1 || heroExistsInCcbt

	// Determine available versions for this hero
	const availableVersions = useMemo(() => {
		const versions: DataVersion[] = []
		if (heroExistsInCbtPhase1) versions.push("cbt-phase-1")
		if (heroExistsInCcbt) versions.push("ccbt")
		versions.push("legacy")
		return versions
	}, [heroExistsInCbtPhase1, heroExistsInCcbt])

	useEffect(() => {
		setShowToggle(showVersionToggle)
		setAvailableVersions(availableVersions)
		return () => setShowToggle(false)
	}, [showVersionToggle, setShowToggle, setAvailableVersions, availableVersions])

	useEffect(() => {
		// If user selects a version that doesn't have this hero, fallback to legacy
		if (version === "cbt-phase-1" && !heroExistsInCbtPhase1) {
			if (heroExistsInCcbt) {
				setVersion("ccbt")
			} else {
				setVersion("legacy")
			}
		} else if (version === "ccbt" && !heroExistsInCcbt) {
			if (heroExistsInCbtPhase1) {
				setVersion("cbt-phase-1")
			} else {
				setVersion("legacy")
			}
		}
	}, [version, heroExistsInCbtPhase1, heroExistsInCcbt, setVersion])

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
	const classPerks = classPerksMap[version] || classPerksLegacy

	return (
		<HeroClient
			heroData={heroData}
			costumes={costumes}
			heroModels={heroModels}
			voiceFiles={voiceFiles}
			availableScenes={availableScenes}
			enableModelsVoices={enableModelsVoices}
			classPerks={classPerks}
		/>
	)
}
