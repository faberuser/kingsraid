"use client"

import { HeroData } from "@/model/Hero"
import HeroesClient from "@/app/heroes/client"
import { useDataVersion } from "@/hooks/use-data-version"
import { DataVersion } from "@/lib/constants"
import { useEnableVersionToggle } from "@/contexts/version-toggle-context"
import { Spinner } from "@/components/ui/spinner"

interface HeroesPageWrapperProps {
	heroesMap: Record<DataVersion, HeroData[]>
	heroClasses: Array<{
		value: string
		name: string
		icon: string
	}>
	releaseOrderMap: Record<DataVersion, Record<string, string>>
	saReverse: string[]
	// heroNamesMap: Record<DataVersion, string[]>
}

export default function HeroesPageWrapper({
	heroesMap,
	heroClasses,
	releaseOrderMap,
	saReverse,
	// heroNamesMap,
}: HeroesPageWrapperProps) {
	const { version, isHydrated } = useDataVersion()
	useEnableVersionToggle()

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
