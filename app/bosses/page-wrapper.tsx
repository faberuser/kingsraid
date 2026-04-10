"use client"

import { BossData } from "@/model/Boss"
import BossesClient from "@/app/bosses/client"
import { useEnableVersionToggle } from "@/contexts/version-toggle-context"
import { useDataVersion } from "@/hooks/use-data-version"
import { DataVersion } from "@/lib/constants"

interface BossesPageWrapperProps {
	bossesMap: Record<DataVersion, BossData[]>
	bossTypeMap: Record<string, string>
	releaseOrderMap: Record<DataVersion, Record<string, string>>
}

export default function BossesPageWrapper({ bossesMap, bossTypeMap, releaseOrderMap }: BossesPageWrapperProps) {
	const { version: dataVersion } = useDataVersion()

	// Enable version toggle on mount - all versions available
	useEnableVersionToggle()

	// Select bosses data based on version
	const bosses = bossesMap[dataVersion] || bossesMap["legacy"] || []
	const releaseOrder = releaseOrderMap[dataVersion] || releaseOrderMap["legacy"] || {}

	return <BossesClient bosses={bosses} bossTypeMap={bossTypeMap} releaseOrder={releaseOrder} />
}
