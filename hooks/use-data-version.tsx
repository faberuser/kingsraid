"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const STORAGE_KEY = "dataVersion"

export type DataVersion = "cbt" | "ccbt" | "legacy"

// Labels for display in UI
export const DataVersionLabels: Record<DataVersion, string> = {
	cbt: "CBT",
	ccbt: "CCBT",
	legacy: "Legacy",
}

// Descriptions for tooltips
export const DataVersionDescriptions: Record<DataVersion, string> = {
	cbt: "Data from Closed Beta Test. Media use Legacy.",
	ccbt: "Data from Content Creator CBT. Media use Legacy.",
	legacy: "Data before Doomsday Update.",
}

interface DataVersionContextType {
	version: DataVersion
	isCbt: boolean
	isCcbt: boolean
	isLegacy: boolean
	setVersion: (version: DataVersion) => void
	isHydrated: boolean
}

const DataVersionContext = createContext<DataVersionContextType | undefined>(undefined)

export function DataVersionProvider({ children }: { children: ReactNode }) {
	// Always start with "cbt" for SSR consistency (newest data as default)
	const [version, setVersionState] = useState<DataVersion>("cbt")
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

	const setVersion = (newVersion: DataVersion) => {
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

	return <DataVersionContext.Provider value={value}>{children}</DataVersionContext.Provider>
}

export function useDataVersion() {
	const context = useContext(DataVersionContext)
	if (context === undefined) {
		throw new Error("useDataVersion must be used within a DataVersionProvider")
	}
	return context
}
