"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const STORAGE_KEY = "dataVersion"
const TEAM_STORAGE_KEY = "team-builder-team"

export type DataVersion = "cbt-phase-2" | "cbt-phase-1" | "ccbt" | "legacy"

// Labels for display in UI
export const DataVersionLabels: Record<DataVersion, string> = {
	"cbt-phase-2": "CBT Phase 2",
	"cbt-phase-1": "CBT Phase 1",
	"ccbt": "CCBT",
	"legacy": "Legacy",
}

// Descriptions for tooltips
export const DataVersionDescriptions: Record<DataVersion, ReactNode> = {
	"cbt-phase-2": (
		<>
			Data from Closed Beta Test Phase 2.
			<br />
			Costumes, Models, Voices use Legacy.
		</>
	),
	"cbt-phase-1": (
		<>
			Data from Closed Beta Test Phase 1.
			<br />
			Costumes, Models, Voices use Legacy.
		</>
	),
	"ccbt": (
		<>
			Data from Content Creator CBT.
			<br />
			Costumes, Models, Voices use Legacy.
		</>
	),
	"legacy": <>Data before Doomsday Patch.</>,
}

interface DataVersionContextType {
	version: DataVersion
	isCbtPhase2: boolean
	isCbtPhase1: boolean
	isCcbt: boolean
	isLegacy: boolean
	setVersion: (version: DataVersion) => void
	setVersionDirect: (version: DataVersion) => void // Bypass team check (for URL loading)
	isHydrated: boolean
}
const DataVersionContext = createContext<DataVersionContextType | undefined>(undefined)

// Check if team has any content in localStorage
function hasTeamContent(): boolean {
	if (typeof window === "undefined") return false
	try {
		const saved = localStorage.getItem(TEAM_STORAGE_KEY)
		if (!saved) return false
		const parsed = JSON.parse(saved)
		return Array.isArray(parsed) && parsed.some((member: { heroName?: string }) => member.heroName)
	} catch {
		return false
	}
}

// Clear team from localStorage
function clearTeamStorage(): void {
	if (typeof window === "undefined") return
	localStorage.removeItem(TEAM_STORAGE_KEY)
}

export function DataVersionProvider({ children }: { children: ReactNode }) {
	// Always start with "cbt-phase-2" for SSR consistency (newest data as default)
	const [version, setVersionState] = useState<DataVersion>("cbt-phase-2")
	const [mounted, setMounted] = useState(false)

	// Dialog state for team clearing confirmation
	const [dialogOpen, setDialogOpen] = useState(false)
	const [pendingVersion, setPendingVersion] = useState<DataVersion | null>(null)
	const isConfirmingRef = useRef(false)

	// Sync with localStorage after hydration
	useEffect(() => {
		// eslint-disable-next-line
		setMounted(true)
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored === "cbt-phase-2" || stored === "cbt-phase-1" || stored === "ccbt" || stored === "legacy") {
			setVersionState(stored)
		} else if (stored === "new" || stored === "cbt") {
			// Migrate old "new" or "cbt" value to "cbt-phase-2"
			setVersionState("cbt-phase-2")
			localStorage.setItem(STORAGE_KEY, "cbt-phase-2")
		}
	}, [])

	// setVersion that checks for team content first
	const setVersion = useCallback(
		(newVersion: DataVersion) => {
			// Skip if same version
			if (newVersion === version) return

			// Check if team has content - if so, show confirmation dialog
			if (hasTeamContent() && !isConfirmingRef.current) {
				setPendingVersion(newVersion)
				setDialogOpen(true)
				return
			}

			// No team content or confirming, just switch
			isConfirmingRef.current = false
			setVersionState(newVersion)
			localStorage.setItem(STORAGE_KEY, newVersion)
		},
		[version],
	)

	// setVersionDirect - bypass team check (for loading from shared URLs)
	const setVersionDirect = useCallback(
		(newVersion: DataVersion) => {
			if (newVersion === version) return
			setVersionState(newVersion)
			localStorage.setItem(STORAGE_KEY, newVersion)
		},
		[version],
	)

	// Handle confirmation - clear team and switch version
	const handleConfirm = useCallback(() => {
		if (pendingVersion) {
			isConfirmingRef.current = true
			clearTeamStorage()
			setVersionState(pendingVersion)
			localStorage.setItem(STORAGE_KEY, pendingVersion)
			// Dispatch custom event so team-builder can react
			window.dispatchEvent(new CustomEvent("team-cleared-by-version-switch"))
		}
		setDialogOpen(false)
		setPendingVersion(null)
	}, [pendingVersion])

	// Handle cancel - just close dialog
	const handleCancel = useCallback(() => {
		setDialogOpen(false)
		setPendingVersion(null)
	}, [])

	const value = {
		version: mounted ? version : "cbt-phase-2",
		isCbtPhase2: mounted ? version === "cbt-phase-2" : true,
		isCbtPhase1: mounted ? version === "cbt-phase-1" : false,
		isCcbt: mounted ? version === "ccbt" : false,
		isLegacy: mounted ? version === "legacy" : false,
		setVersion,
		setVersionDirect,
		isHydrated: mounted,
	}

	return (
		<DataVersionContext.Provider value={value}>
			{children}
			<AlertDialog open={dialogOpen} onOpenChange={(open) => !open && handleCancel()}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Switch Data Version?</AlertDialogTitle>
						<AlertDialogDescription>
							You have a team saved in Team Builder. Switching data versions will clear your team because
							heroes may not exist in the other version.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirm}>Switch & Clear Team</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DataVersionContext.Provider>
	)
}

export function useDataVersion() {
	const context = useContext(DataVersionContext)
	if (context === undefined) {
		throw new Error("useDataVersion must be used within a DataVersionProvider")
	}
	return context
}
