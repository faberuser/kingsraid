"use client"

import { ArtifactData } from "@/model/Artifact"
import ArtifactsClient from "@/app/artifacts/client"
import { useDataVersion } from "@/hooks/use-data-version"
import { DataVersion } from "@/lib/constants"
import { useEnableVersionToggle } from "@/contexts/version-toggle-context"
import { Spinner } from "@/components/ui/spinner"

interface ArtifactsPageWrapperProps {
	artifactsMap: Record<DataVersion, ArtifactData[]>
	releaseOrderMap: Record<DataVersion, Record<string, string>>
}

export default function ArtifactsPageWrapper({ artifactsMap, releaseOrderMap }: ArtifactsPageWrapperProps) {
	const { version, isHydrated } = useDataVersion()
	useEnableVersionToggle()

	const artifacts = artifactsMap[version]
	const releaseOrder = releaseOrderMap[version]

	// Show loading spinner until hydrated
	if (!isHydrated) {
		return (
			<div className="flex items-center justify-center h-96">
				<Spinner className="h-8 w-8" />
			</div>
		)
	}

	return <ArtifactsClient artifacts={artifacts} releaseOrder={releaseOrder} />
}
