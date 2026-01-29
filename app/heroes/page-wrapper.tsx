"use client"

import { HeroData } from "@/model/Hero"
import HeroesClient from "@/app/heroes/client"
import { useHeroDataVersion, HeroDataVersion } from "@/hooks/use-hero-data-version"
import { useHeroToggle } from "@/contexts/hero-toggle-context"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"

interface HeroesPageWrapperProps {
	heroesCbt: HeroData[]
	heroesCcbt: HeroData[]
	heroesLegacy: HeroData[]
	heroClasses: Array<{
		value: string
		name: string
		icon: string
	}>
	releaseOrderCbt: Record<string, string>
	releaseOrderCcbt: Record<string, string>
	releaseOrderLegacy: Record<string, string>
	saReverse: string[]
	cbtHeroNames: string[]
	ccbtHeroNames: string[]
}

export default function HeroesPageWrapper({
	heroesCbt,
	heroesCcbt,
	heroesLegacy,
	heroClasses,
	releaseOrderCbt,
	releaseOrderCcbt,
	releaseOrderLegacy,
	saReverse,
}: HeroesPageWrapperProps) {
	const { version, isHydrated } = useHeroDataVersion()
	const { setShowToggle } = useHeroToggle()

	useEffect(() => {
		setShowToggle(true)
		return () => setShowToggle(false)
	}, [setShowToggle])

	const heroesMap: Record<HeroDataVersion, HeroData[]> = useMemo(
		() => ({
			cbt: heroesCbt,
			ccbt: heroesCcbt,
			legacy: heroesLegacy,
		}),
		[heroesCbt, heroesCcbt, heroesLegacy],
	)

	const releaseOrderMap: Record<HeroDataVersion, Record<string, string>> = useMemo(
		() => ({
			cbt: releaseOrderCbt,
			ccbt: releaseOrderCcbt,
			legacy: releaseOrderLegacy,
		}),
		[releaseOrderCbt, releaseOrderCcbt, releaseOrderLegacy],
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
