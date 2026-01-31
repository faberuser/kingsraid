"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

const STORAGE_KEY = "dataVersion"

export type DataVersion = "cbt-phase-1" | "ccbt" | "legacy"

// Order of versions for keyboard navigation (left/right arrows)
const VERSION_ORDER: DataVersion[] = ["cbt-phase-1", "ccbt", "legacy"]

// Labels for display in UI
export const DataVersionLabels: Record<DataVersion, string> = {
	"cbt-phase-1": "CBT Phase 1",
	"ccbt": "CCBT",
	"legacy": "Legacy",
}

// Descriptions for tooltips
export const DataVersionDescriptions: Record<DataVersion, ReactNode> = {
	"cbt-phase-1": (
		<>
			Data from Closed Beta Test Phase 1.
			<br />
			Costumes, Models, Voices use Legacy.
			<br />
			<span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground mt-1">
				<ArrowLeft className="h-3 w-3" />
				<ArrowRight className="h-3 w-3" />
				to switch versions
			</span>
		</>
	),
	"ccbt": (
		<>
			Data from Content Creator CBT.
			<br />
			Costumes, Models, Voices use Legacy.
			<br />
			<span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground mt-1">
				<ArrowLeft className="h-3 w-3" />
				<ArrowRight className="h-3 w-3" />
				to switch versions
			</span>
		</>
	),
	"legacy": (
		<>
			Data before Doomsday Patch.
			<br />
			<span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground mt-1">
				<ArrowLeft className="h-3 w-3" />
				<ArrowRight className="h-3 w-3" />
				to switch versions
			</span>
		</>
	),
}

interface DataVersionContextType {
	version: DataVersion
	isCbtPhase1: boolean
	isCcbt: boolean
	isLegacy: boolean
	setVersion: (version: DataVersion) => void
	isHydrated: boolean
}

const DataVersionContext = createContext<DataVersionContextType | undefined>(undefined)

export function DataVersionProvider({ children }: { children: ReactNode }) {
	// Always start with "cbt-phase-1" for SSR consistency (newest data as default)
	const [version, setVersionState] = useState<DataVersion>("cbt-phase-1")
	const [mounted, setMounted] = useState(false)

	// Sync with localStorage after hydration
	useEffect(() => {
		// eslint-disable-next-line
		setMounted(true)
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored === "cbt-phase-1" || stored === "ccbt" || stored === "legacy") {
			setVersionState(stored)
		} else if (stored === "new" || stored === "cbt") {
			// Migrate old "new" or "cbt" value to "cbt-phase-1"
			setVersionState("cbt-phase-1")
			localStorage.setItem(STORAGE_KEY, "cbt-phase-1")
		}
	}, [])

	const setVersion = useCallback((newVersion: DataVersion) => {
		setVersionState(newVersion)
		localStorage.setItem(STORAGE_KEY, newVersion)
	}, [])

	// Keyboard shortcuts: Left/Right arrows to switch versions
	useEffect(() => {
		if (!mounted) return

		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't trigger if user is typing in an input/textarea or has modifier keys
			const target = e.target as HTMLElement
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable ||
				e.ctrlKey ||
				e.metaKey ||
				e.altKey
			) {
				return
			}

			if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				setVersionState((currentVersion) => {
					const currentIndex = VERSION_ORDER.indexOf(currentVersion)
					let newIndex: number

					if (e.key === "ArrowLeft") {
						// Go to previous version (wraps around)
						newIndex = currentIndex <= 0 ? VERSION_ORDER.length - 1 : currentIndex - 1
					} else {
						// Go to next version (wraps around)
						newIndex = currentIndex >= VERSION_ORDER.length - 1 ? 0 : currentIndex + 1
					}

					const newVersion = VERSION_ORDER[newIndex]
					localStorage.setItem(STORAGE_KEY, newVersion)
					return newVersion
				})
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [mounted])

	const value = {
		version: mounted ? version : "cbt-phase-1",
		isCbtPhase1: mounted ? version === "cbt-phase-1" : true,
		isCcbt: mounted ? version === "ccbt" : false,
		isLegacy: mounted ? version === "legacy" : false,
		setVersion,
		isHydrated: mounted,
	}

	return <DataVersionContext.Provider value={value}>{children}</DataVersionContext.Provider>
}

export function useDataVersion() {
	const context = useContext(DataVersionContext)
	if (context === undefined) {
		throw new Error("useDataVersion must be used within a DataVersionProvider")
	}
	return context
}
