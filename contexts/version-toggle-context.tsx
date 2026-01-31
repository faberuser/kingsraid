"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { DataVersion } from "@/hooks/use-data-version"

interface HeroToggleContextType {
	showToggle: boolean
	setShowToggle: (show: boolean) => void
	availableVersions: DataVersion[]
	setAvailableVersions: (versions: DataVersion[]) => void
}

const HeroToggleContext = createContext<HeroToggleContextType | undefined>(undefined)

export function HeroToggleProvider({ children }: { children: ReactNode }) {
	const [showToggle, setShowToggle] = useState(false)
	const [availableVersions, setAvailableVersions] = useState<DataVersion[]>(["cbt-phase-1", "ccbt", "legacy"])

	return (
		<HeroToggleContext.Provider value={{ showToggle, setShowToggle, availableVersions, setAvailableVersions }}>
			{children}
		</HeroToggleContext.Provider>
	)
}

export function useHeroToggle() {
	const context = useContext(HeroToggleContext)
	if (context === undefined) {
		throw new Error("useHeroToggle must be used within a HeroToggleProvider")
	}
	return context
}
