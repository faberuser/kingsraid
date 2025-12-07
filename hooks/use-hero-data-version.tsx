"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const STORAGE_KEY = "heroDataVersion"

export type HeroDataVersion = "legacy" | "new"

interface HeroDataVersionContextType {
	version: HeroDataVersion
	isLegacy: boolean
	isNew: boolean
	toggleVersion: () => void
	setVersion: (version: HeroDataVersion) => void
	isHydrated: boolean
}

const HeroDataVersionContext = createContext<HeroDataVersionContextType | undefined>(undefined)

export function HeroDataVersionProvider({ children }: { children: ReactNode }) {
	// Always start with "new" for SSR consistency
	const [version, setVersionState] = useState<HeroDataVersion>("new")
	const [mounted, setMounted] = useState(false)

	// Sync with localStorage after hydration
	useEffect(() => {
		// eslint-disable-next-line
		setMounted(true)
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored === "new" || stored === "legacy") {
			setVersionState(stored)
		}
	}, [])

	const toggleVersion = () => {
		const newVersion: HeroDataVersion = version === "legacy" ? "new" : "legacy"
		setVersionState(newVersion)
		localStorage.setItem(STORAGE_KEY, newVersion)
	}

	const setVersion = (newVersion: HeroDataVersion) => {
		setVersionState(newVersion)
		localStorage.setItem(STORAGE_KEY, newVersion)
	}

	const value = {
		version: mounted ? version : "new",
		isLegacy: mounted ? version === "legacy" : false,
		isNew: mounted ? version === "new" : true,
		toggleVersion,
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
