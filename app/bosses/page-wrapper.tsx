"use client"

import { BossData } from "@/model/Boss"
import BossesClient from "@/app/bosses/client"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useDataVersion } from "@/hooks/use-data-version"
import { useEffect, useMemo } from "react"

interface BossesPageWrapperProps {
	bossesLegacy: BossData[]
	bossesCcbt: BossData[]
	bossesCbtPhase1: BossData[]
	bossTypeMap: Record<string, string>
	releaseOrder: Record<string, string>
}

export default function BossesPageWrapper({
	bossesLegacy,
	bossesCcbt,
	bossesCbtPhase1,
	bossTypeMap,
	releaseOrder,
}: BossesPageWrapperProps) {
	const { setShowToggle, setAvailableVersions } = useHeroToggle()
	const { version: dataVersion } = useDataVersion()

	// Enable version toggle on mount - all versions available
	useEffect(() => {
		setAvailableVersions(["cbt-phase-1", "ccbt", "legacy"])
		setShowToggle(true)
		return () => setShowToggle(false)
	}, [setAvailableVersions, setShowToggle])

	// Select bosses data based on version
	const bosses = useMemo(() => {
		switch (dataVersion) {
			case "cbt-phase-1":
				return bossesCbtPhase1
			case "ccbt":
				return bossesCcbt
			default:
				return bossesLegacy
		}
	}, [dataVersion, bossesLegacy, bossesCcbt, bossesCbtPhase1])

	return <BossesClient bosses={bosses} bossTypeMap={bossTypeMap} releaseOrder={releaseOrder} />
}
