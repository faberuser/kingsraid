"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import { DataVersion } from "@/hooks/use-data-version"

const STORAGE_KEY = "compareMode"
const LEFT_VERSION_KEY = "compareLeftVersion"
const RIGHT_VERSION_KEY = "compareRightVersion"

interface CompareModeContextType {
	isCompareMode: boolean
	setCompareMode: (enabled: boolean) => void
	toggleCompareMode: () => void
	leftVersion: DataVersion
	rightVersion: DataVersion
	setLeftVersion: (version: DataVersion) => void
	setRightVersion: (version: DataVersion) => void
	swapVersions: () => void
	isHydrated: boolean
}

const CompareModeContext = createContext<CompareModeContextType | undefined>(undefined)

export function CompareModeProvider({ children }: { children: ReactNode }) {
	const [isCompareMode, setIsCompareMode] = useState(false)
	const [leftVersion, setLeftVersionState] = useState<DataVersion>("cbt-phase-1")
	const [rightVersion, setRightVersionState] = useState<DataVersion>("legacy")
	const [mounted, setMounted] = useState(false)

	// Sync with localStorage after hydration
	useEffect(() => {
		// eslint-disable-next-line
		setMounted(true)
		const storedCompareMode = localStorage.getItem(STORAGE_KEY)
		const storedLeftVersion = localStorage.getItem(LEFT_VERSION_KEY)
		const storedRightVersion = localStorage.getItem(RIGHT_VERSION_KEY)

		if (storedCompareMode === "true") {
			setIsCompareMode(true)
		}

		if (storedLeftVersion === "cbt-phase-1" || storedLeftVersion === "ccbt" || storedLeftVersion === "legacy") {
			setLeftVersionState(storedLeftVersion)
		}

		if (storedRightVersion === "cbt-phase-1" || storedRightVersion === "ccbt" || storedRightVersion === "legacy") {
			setRightVersionState(storedRightVersion)
		}
	}, [])

	const setCompareMode = useCallback((enabled: boolean) => {
		setIsCompareMode(enabled)
		localStorage.setItem(STORAGE_KEY, String(enabled))
	}, [])

	const toggleCompareMode = useCallback(() => {
		setIsCompareMode((prev) => {
			const newValue = !prev
			localStorage.setItem(STORAGE_KEY, String(newValue))
			return newValue
		})
	}, [])

	const setLeftVersion = useCallback(
		(version: DataVersion) => {
			// Don't allow same version on both sides
			if (version === rightVersion) {
				// Swap instead
				setLeftVersionState(version)
				setRightVersionState(leftVersion)
				localStorage.setItem(LEFT_VERSION_KEY, version)
				localStorage.setItem(RIGHT_VERSION_KEY, leftVersion)
			} else {
				setLeftVersionState(version)
				localStorage.setItem(LEFT_VERSION_KEY, version)
			}
		},
		[rightVersion, leftVersion],
	)

	const setRightVersion = useCallback(
		(version: DataVersion) => {
			// Don't allow same version on both sides
			if (version === leftVersion) {
				// Swap instead
				setRightVersionState(version)
				setLeftVersionState(rightVersion)
				localStorage.setItem(RIGHT_VERSION_KEY, version)
				localStorage.setItem(LEFT_VERSION_KEY, rightVersion)
			} else {
				setRightVersionState(version)
				localStorage.setItem(RIGHT_VERSION_KEY, version)
			}
		},
		[leftVersion, rightVersion],
	)

	const swapVersions = useCallback(() => {
		setLeftVersionState(rightVersion)
		setRightVersionState(leftVersion)
		localStorage.setItem(LEFT_VERSION_KEY, rightVersion)
		localStorage.setItem(RIGHT_VERSION_KEY, leftVersion)
	}, [leftVersion, rightVersion])

	const value = {
		isCompareMode: mounted ? isCompareMode : false,
		setCompareMode,
		toggleCompareMode,
		leftVersion: mounted ? leftVersion : "cbt-phase-1",
		rightVersion: mounted ? rightVersion : "legacy",
		setLeftVersion,
		setRightVersion,
		swapVersions,
		isHydrated: mounted,
	}

	return <CompareModeContext.Provider value={value}>{children}</CompareModeContext.Provider>
}

export function useCompareMode() {
	const context = useContext(CompareModeContext)
	if (context === undefined) {
		throw new Error("useCompareMode must be used within a CompareModeProvider")
	}
	return context
}
