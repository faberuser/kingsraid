"use client"

import { HeroData } from "@/model/Hero"
import HeroesClient from "@/app/heroes/client"
import { useHeroDataVersion } from "@/hooks/use-hero-data-version"
import { useHeroToggle } from "@/contexts/hero-toggle-context"
import { useEffect, useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"

interface HeroesPageWrapperProps {
	heroesLegacy: HeroData[]
	heroesNew: HeroData[]
	heroClasses: Array<{
		value: string
		name: string
		icon: string
	}>
	releaseOrderLegacy: Record<string, string>
	releaseOrderNew: Record<string, string>
	saReverse: string[]
	newDataHeroNames: string[]
}

export default function HeroesPageWrapper({
	heroesLegacy,
	heroesNew,
	heroClasses,
	releaseOrderLegacy,
	releaseOrderNew,
	saReverse,
}: HeroesPageWrapperProps) {
	const { isNew, isHydrated } = useHeroDataVersion()
	const { setShowToggle } = useHeroToggle()

	useEffect(() => {
		setShowToggle(true)
		return () => setShowToggle(false)
	}, [setShowToggle])

	const heroes = useMemo(() => (isNew ? heroesNew : heroesLegacy), [isNew, heroesNew, heroesLegacy])
	const releaseOrder = useMemo(
		() => (isNew ? releaseOrderNew : releaseOrderLegacy),
		[isNew, releaseOrderNew, releaseOrderLegacy]
	)

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
