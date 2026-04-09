"use client"

import SoftcapClient from "@/app/softcap/client"
import { useEnableVersionToggle } from "@/contexts/version-toggle-context"
import { useDataVersion } from "@/hooks/use-data-version"
import { DataVersion } from "@/lib/constants"

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
	softcapMap: Record<DataVersion, SoftcapData>
}

export default function SoftcapPageWrapper({ softcapMap }: SoftcapPageWrapperProps) {
	const { version: dataVersion } = useDataVersion()

	// Enable version toggle on mount - all versions available
	useEnableVersionToggle()

	// Select softcap data based on version
	const softcapData = softcapMap[dataVersion]

	return <SoftcapClient softcapData={softcapData} />
}
