"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { DataVersion, DATA_VERSIONS } from "@/lib/constants"

interface HeroToggleContextType {
	showToggle: boolean
	setShowToggle: (show: boolean) => void
	availableVersions: DataVersion[]
	setAvailableVersions: (versions: DataVersion[]) => void
}

const HeroToggleContext = createContext<HeroToggleContextType | undefined>(undefined)

export function HeroToggleProvider({ children }: { children: ReactNode }) {
	const [showToggle, setShowToggle] = useState(false)
	const [availableVersions, setAvailableVersions] = useState<DataVersion[]>([...DATA_VERSIONS])

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

export function useEnableVersionToggle(versions: DataVersion[] = [...DATA_VERSIONS], showToggle: boolean = true) {
	const { setShowToggle, setAvailableVersions } = useHeroToggle()

	const versionsList = versions.join(",")

	useEffect(() => {
		setShowToggle(showToggle)
		// "".split(",") returns [""] so we handle empty string specifically
		if (versionsList === "") {
			setAvailableVersions([])
		} else {
			setAvailableVersions(versionsList.split(",") as DataVersion[])
		}
		return () => setShowToggle(false)
	}, [setShowToggle, setAvailableVersions, versionsList, showToggle])
}
