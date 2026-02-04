"use client"

import { useMemo, useCallback } from "react"
import HeroClient from "@/app/heroes/[...slug]/client"
import { HeroData } from "@/model/Hero"
import { Costume, ModelFile } from "@/model/Hero_Model"
import { VoiceFiles } from "@/components/heroes/voices"
import { DataVersion } from "@/hooks/use-data-version"
import { useCompareMode } from "@/hooks/use-compare-mode"
import { CompareLayout } from "@/components/compare"
import { ClassPerksData } from "@/components/heroes/perks"

interface HeroCompareWrapperProps {
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
	availableVersions: DataVersion[]
	// Current version data for single view
	currentHeroData: HeroData
	currentCostumes: Costume[]
	currentHeroModels: { [costume: string]: ModelFile[] }
	currentVoiceFiles: VoiceFiles
	currentClassPerks: ClassPerksData
}

export default function HeroCompareWrapper({
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
	availableVersions,
	currentHeroData,
	currentCostumes,
	currentHeroModels,
	currentVoiceFiles,
	currentClassPerks,
}: HeroCompareWrapperProps) {
	const { isCompareMode, isHydrated } = useCompareMode()

	// Map of data by version
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

	// Get data for comparison versions with fallbacks
	const getVersionData = useCallback(
		(version: DataVersion) => {
			const heroData = heroDataMap[version] || heroDataLegacy
			const costumes = costumesMap[version].length > 0 ? costumesMap[version] : costumesLegacy
			const heroModels =
				Object.keys(heroModelsMap[version]).length > 0 ? heroModelsMap[version] : heroModelsLegacy
			const voiceFiles =
				voiceFilesMap[version].en.length > 0 ||
				voiceFilesMap[version].jp.length > 0 ||
				voiceFilesMap[version].kr.length > 0
					? voiceFilesMap[version]
					: voiceFilesLegacy
			const classPerks = classPerksMap[version] || classPerksLegacy

			return { heroData, costumes, heroModels, voiceFiles, classPerks }
		},
		[
			heroDataMap,
			heroDataLegacy,
			costumesMap,
			costumesLegacy,
			heroModelsMap,
			heroModelsLegacy,
			voiceFilesMap,
			voiceFilesLegacy,
			classPerksMap,
			classPerksLegacy,
		],
	)

	// Render content for a specific version
	const renderVersionContent = useCallback(
		(version: DataVersion) => {
			if (!heroDataMap[version]) {
				return null
			}
			const versionData = getVersionData(version)
			return (
				<HeroClient
					heroData={versionData.heroData}
					costumes={versionData.costumes}
					heroModels={versionData.heroModels}
					voiceFiles={versionData.voiceFiles}
					availableScenes={availableScenes}
					enableModelsVoices={enableModelsVoices}
					classPerks={versionData.classPerks}
				/>
			)
		},
		[heroDataMap, getVersionData, availableScenes, enableModelsVoices],
	)

	if (!isHydrated || !isCompareMode) {
		return (
			<HeroClient
				heroData={currentHeroData}
				costumes={currentCostumes}
				heroModels={currentHeroModels}
				voiceFiles={currentVoiceFiles}
				availableScenes={availableScenes}
				enableModelsVoices={enableModelsVoices}
				classPerks={currentClassPerks}
			/>
		)
	}

	return (
		<CompareLayout availableVersions={availableVersions} renderContent={renderVersionContent}>
			<HeroClient
				heroData={currentHeroData}
				costumes={currentCostumes}
				heroModels={currentHeroModels}
				voiceFiles={currentVoiceFiles}
				availableScenes={availableScenes}
				enableModelsVoices={enableModelsVoices}
				classPerks={currentClassPerks}
			/>
		</CompareLayout>
	)
}
