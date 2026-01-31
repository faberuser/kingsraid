"use client"

import BossClient from "@/app/bosses/[...slug]/client"
import { BossData } from "@/model/Boss"
import { ModelFile } from "@/model/Hero_Model"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useDataVersion } from "@/hooks/use-data-version"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

const PREVIOUS_VERSION_KEY = "kr-previous-data-version"

// Boss models are now organized by variant (similar to hero costumes)
type BossModelData = Record<string, ModelFile[]>

interface BossPageWrapperProps {
	bossData: BossData
	bossModels?: BossModelData
	bossScenes?: Array<{ value: string; label: string }>
	enableModelsVoices?: boolean
}

export default function BossPageWrapper({
	bossData,
	bossModels,
	bossScenes = [],
	enableModelsVoices = false,
}: BossPageWrapperProps) {
	const { setShowToggle, setAvailableVersions } = useHeroToggle()
	const { version, setVersion } = useDataVersion()
	const pathname = usePathname()

	// Set available versions on every navigation to this page
	useEffect(() => {
		setAvailableVersions(["legacy"])
		setShowToggle(true)
	}, [setAvailableVersions, setShowToggle, pathname])

	// Save previous version and force to legacy
	useEffect(() => {
		if (version !== "legacy") {
			// Save current version before switching to legacy
			sessionStorage.setItem(PREVIOUS_VERSION_KEY, version)
			setVersion("legacy")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Only run on mount

	// Restore previous version when leaving to a non-legacy-only page
	useEffect(() => {
		return () => {
			const savedVersion = sessionStorage.getItem(PREVIOUS_VERSION_KEY)
			if (savedVersion && savedVersion !== "legacy") {
				// Use setTimeout to ensure this runs after the new page's effects
				setTimeout(() => {
					// Only restore if we're not on a legacy-only page anymore
					const currentPath = window.location.pathname
					if (!currentPath.startsWith("/bosses") && !currentPath.startsWith("/softcap")) {
						setVersion(savedVersion as "cbt-phase-1" | "ccbt" | "legacy")
						sessionStorage.removeItem(PREVIOUS_VERSION_KEY)
					}
				}, 0)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<BossClient
			bossData={bossData}
			bossModels={bossModels}
			bossScenes={bossScenes}
			enableModelsVoices={enableModelsVoices}
		/>
	)
}
