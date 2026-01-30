"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface HeroToggleContextType {
	showToggle: boolean
	setShowToggle: (show: boolean) => void
}

const HeroToggleContext = createContext<HeroToggleContextType | undefined>(undefined)

export function HeroToggleProvider({ children }: { children: ReactNode }) {
	const [showToggle, setShowToggle] = useState(false)

	return <HeroToggleContext.Provider value={{ showToggle, setShowToggle }}>{children}</HeroToggleContext.Provider>
}

export function useHeroToggle() {
	const context = useContext(HeroToggleContext)
	if (context === undefined) {
		throw new Error("useHeroToggle must be used within a HeroToggleProvider")
	}
	return context
}
