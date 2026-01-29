"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const STORAGE_KEY = "heroDataVersion"

export type HeroDataVersion = "cbt" | "ccbt" | "legacy"

// Labels for display in UI
export const HeroDataVersionLabels: Record<HeroDataVersion, string> = {
	cbt: "CBT",
	ccbt: "CCBT",
	legacy: "Legacy",
}

// Descriptions for tooltips
export const HeroDataVersionDescriptions: Record<HeroDataVersion, string> = {
	cbt: "Data from Closed Beta Test. Media use Legacy.",
	ccbt: "Data from Content Creator CBT. Media use Legacy.",
	legacy: "Data before Doomsday Update.",
}

interface HeroDataVersionContextType {
	version: HeroDataVersion
	isCbt: boolean
	isCcbt: boolean
	isLegacy: boolean
	setVersion: (version: HeroDataVersion) => void
	isHydrated: boolean
}

const HeroDataVersionContext = createContext<HeroDataVersionContextType | undefined>(undefined)

export function HeroDataVersionProvider({ children }: { children: ReactNode }) {
	// Always start with "cbt" for SSR consistency (newest data as default)
	const [version, setVersionState] = useState<HeroDataVersion>("cbt")
	const [mounted, setMounted] = useState(false)

	// Sync with localStorage after hydration
	useEffect(() => {
		// eslint-disable-next-line
		setMounted(true)
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored === "cbt" || stored === "ccbt" || stored === "legacy") {
			setVersionState(stored)
		} else if (stored === "new") {
			// Migrate old "new" value to "ccbt"
			setVersionState("ccbt")
			localStorage.setItem(STORAGE_KEY, "ccbt")
		}
	}, [])

	const setVersion = (newVersion: HeroDataVersion) => {
		setVersionState(newVersion)
		localStorage.setItem(STORAGE_KEY, newVersion)
	}

	const value = {
		version: mounted ? version : "cbt",
		isCbt: mounted ? version === "cbt" : true,
		isCcbt: mounted ? version === "ccbt" : false,
		isLegacy: mounted ? version === "legacy" : false,
		setVersion,
		isHydrated: mounted,
	}

	return <HeroDataVersionContext.Provider value={value}>{children}</HeroDataVersionContext.Provider>
}

export function useHeroDataVersion() {
	const context = useContext(HeroDataVersionContext)
	if (context === undefined) {
		throw new Error("useHeroDataVersion must be used within a HeroDataVersionProvider")
	}
	return context
}
