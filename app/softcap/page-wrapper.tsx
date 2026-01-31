"use client"

import SoftcapClient from "@/app/softcap/client"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useDataVersion } from "@/hooks/use-data-version"
import { useEffect, useMemo } from "react"

interface SoftcapData {
	[statName: string]: {
		MaxK: number
		X1: number
		A1: number
		B1: number
		X2: number
		A2: number
		B2: number
		MinK: number
		X3: number
		A3: number
		B3: number
		X4: number
		A4: number
		B4: number
	}
}

interface SoftcapPageWrapperProps {
	softcapLegacy: SoftcapData
	softcapCcbt: SoftcapData
	softcapCbtPhase1: SoftcapData
}

export default function SoftcapPageWrapper({ softcapLegacy, softcapCcbt, softcapCbtPhase1 }: SoftcapPageWrapperProps) {
	const { setShowToggle, setAvailableVersions } = useHeroToggle()
	const { version: dataVersion } = useDataVersion()

	// Enable version toggle on mount - all versions available
	useEffect(() => {
		setAvailableVersions(["cbt-phase-1", "ccbt", "legacy"])
		setShowToggle(true)
		return () => setShowToggle(false)
	}, [setAvailableVersions, setShowToggle])

	// Select softcap data based on version
	const softcapData = useMemo(() => {
		switch (dataVersion) {
			case "cbt-phase-1":
				return softcapCbtPhase1
			case "ccbt":
				return softcapCcbt
			default:
				return softcapLegacy
		}
	}, [dataVersion, softcapLegacy, softcapCcbt, softcapCbtPhase1])

	return <SoftcapClient softcapData={softcapData} />
}
