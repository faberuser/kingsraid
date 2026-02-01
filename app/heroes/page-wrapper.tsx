"use client"

import { HeroData } from "@/model/Hero"
import HeroesClient from "@/app/heroes/client"
import { useDataVersion, DataVersion } from "@/hooks/use-data-version"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"

interface HeroesPageWrapperProps {
	heroesCbtPhase1: HeroData[]
	heroesCcbt: HeroData[]
	heroesLegacy: HeroData[]
	heroClasses: Array<{
		value: string
		name: string
		icon: string
	}>
	releaseOrderCbtPhase1: Record<string, string>
	releaseOrderCcbt: Record<string, string>
	releaseOrderLegacy: Record<string, string>
	saReverse: string[]
	cbtPhase1HeroNames: string[]
	ccbtHeroNames: string[]
}

export default function HeroesPageWrapper({
	heroesCbtPhase1,
	heroesCcbt,
	heroesLegacy,
	heroClasses,
	releaseOrderCbtPhase1,
	releaseOrderCcbt,
	releaseOrderLegacy,
	saReverse,
}: HeroesPageWrapperProps) {
	const { version, isHydrated } = useDataVersion()
	const { setShowToggle, setAvailableVersions } = useHeroToggle()

	useEffect(() => {
		setShowToggle(true)
		setAvailableVersions(["cbt-phase-1", "ccbt", "legacy"])
		return () => setShowToggle(false)
	}, [setShowToggle, setAvailableVersions])

	const heroesMap: Record<DataVersion, HeroData[]> = useMemo(
		() => ({
			"cbt-phase-1": heroesCbtPhase1,
			"ccbt": heroesCcbt,
			"legacy": heroesLegacy,
		}),
		[heroesCbtPhase1, heroesCcbt, heroesLegacy],
	)

	const releaseOrderMap: Record<DataVersion, Record<string, string>> = useMemo(
		() => ({
			"cbt-phase-1": releaseOrderCbtPhase1,
			"ccbt": releaseOrderCcbt,
			"legacy": releaseOrderLegacy,
		}),
		[releaseOrderCbtPhase1, releaseOrderCcbt, releaseOrderLegacy],
	)

	const heroes = heroesMap[version]
	const releaseOrder = releaseOrderMap[version]

	// Show loading spinner until hydrated
	if (!isHydrated) {
		return (
			<div className="flex items-center justify-center h-96">
				<Spinner className="h-8 w-8" />
			</div>
		)
	}

	return <HeroesClient heroes={heroes} heroClasses={heroClasses} releaseOrder={releaseOrder} saReverse={saReverse} />
}
