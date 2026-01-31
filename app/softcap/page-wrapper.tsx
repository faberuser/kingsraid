"use client"

import SoftcapClient from "@/app/softcap/client"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import { useDataVersion } from "@/hooks/use-data-version"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

const PREVIOUS_VERSION_KEY = "kr-previous-data-version"

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
	softcapData: SoftcapData
}

export default function SoftcapPageWrapper({ softcapData }: SoftcapPageWrapperProps) {
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

	return <SoftcapClient softcapData={softcapData} />
}
