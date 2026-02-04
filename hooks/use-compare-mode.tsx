"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import { DataVersion } from "@/hooks/use-data-version"

const STORAGE_KEY = "compareMode"
const VERSIONS_KEY = "compareVersions"

// All available versions
export const ALL_VERSIONS: DataVersion[] = ["cbt-phase-1", "ccbt", "legacy"]

// Validate if a string is a valid DataVersion
function isValidVersion(version: string): version is DataVersion {
	return version === "cbt-phase-1" || version === "ccbt" || version === "legacy"
}

interface CompareModeContextType {
	isCompareMode: boolean
	setCompareMode: (enabled: boolean) => void
	toggleCompareMode: () => void
	/** Array of versions to compare (minimum 2 when in compare mode) */
	compareVersions: DataVersion[]
	/** Add a version to compare */
	addVersion: (version: DataVersion) => void
	/** Remove a version from comparison */
	removeVersion: (version: DataVersion) => void
	/** Update version at specific index */
	setVersionAtIndex: (index: number, version: DataVersion) => void
	/** Swap two versions by their indices */
	swapVersions: (index1: number, index2: number) => void
	/** Get versions that are not currently being compared */
	getAvailableVersionsToAdd: (availableVersions: DataVersion[]) => DataVersion[]
	/** Check if more versions can be added */
	canAddMore: (availableVersions: DataVersion[]) => boolean
	isHydrated: boolean
	// Legacy support - first two versions for backward compatibility
	leftVersion: DataVersion
	rightVersion: DataVersion
	setLeftVersion: (version: DataVersion) => void
	setRightVersion: (version: DataVersion) => void
}

const CompareModeContext = createContext<CompareModeContextType | undefined>(undefined)

export function CompareModeProvider({ children }: { children: ReactNode }) {
	const [isCompareMode, setIsCompareMode] = useState(false)
	const [compareVersions, setCompareVersions] = useState<DataVersion[]>(["cbt-phase-1", "legacy"])
	const [mounted, setMounted] = useState(false)

	// Sync with localStorage after hydration
	useEffect(() => {
		// eslint-disable-next-line
		setMounted(true)
		const storedCompareMode = localStorage.getItem(STORAGE_KEY)
		const storedVersions = localStorage.getItem(VERSIONS_KEY)

		if (storedCompareMode === "true") {
			setIsCompareMode(true)
		}

		if (storedVersions) {
			try {
				const parsed = JSON.parse(storedVersions)
				if (Array.isArray(parsed) && parsed.length >= 2 && parsed.every(isValidVersion)) {
					setCompareVersions(parsed)
				}
			} catch {
				// Use default versions
			}
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

	const saveVersions = useCallback((versions: DataVersion[]) => {
		localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions))
	}, [])

	const addVersion = useCallback(
		(version: DataVersion) => {
			if (!compareVersions.includes(version)) {
				const newVersions = [...compareVersions, version]
				setCompareVersions(newVersions)
				saveVersions(newVersions)
			}
		},
		[compareVersions, saveVersions],
	)

	const removeVersion = useCallback(
		(version: DataVersion) => {
			// Don't allow fewer than 2 versions
			if (compareVersions.length <= 2) return
			const newVersions = compareVersions.filter((v) => v !== version)
			setCompareVersions(newVersions)
			saveVersions(newVersions)
		},
		[compareVersions, saveVersions],
	)

	const setVersionAtIndex = useCallback(
		(index: number, version: DataVersion) => {
			if (index < 0 || index >= compareVersions.length) return
			// Check if version already exists at another position
			const existingIndex = compareVersions.indexOf(version)
			if (existingIndex !== -1 && existingIndex !== index) {
				// Swap the versions
				const newVersions = [...compareVersions]
				newVersions[existingIndex] = compareVersions[index]
				newVersions[index] = version
				setCompareVersions(newVersions)
				saveVersions(newVersions)
			} else if (existingIndex === -1) {
				// Simply set the new version
				const newVersions = [...compareVersions]
				newVersions[index] = version
				setCompareVersions(newVersions)
				saveVersions(newVersions)
			}
		},
		[compareVersions, saveVersions],
	)

	const swapVersions = useCallback(
		(index1: number, index2: number) => {
			if (index1 < 0 || index1 >= compareVersions.length || index2 < 0 || index2 >= compareVersions.length) {
				return
			}
			const newVersions = [...compareVersions]
			const temp = newVersions[index1]
			newVersions[index1] = newVersions[index2]
			newVersions[index2] = temp
			setCompareVersions(newVersions)
			saveVersions(newVersions)
		},
		[compareVersions, saveVersions],
	)

	const getAvailableVersionsToAdd = useCallback(
		(availableVersions: DataVersion[]) => {
			return availableVersions.filter((v) => !compareVersions.includes(v))
		},
		[compareVersions],
	)

	const canAddMore = useCallback(
		(availableVersions: DataVersion[]) => {
			return getAvailableVersionsToAdd(availableVersions).length > 0
		},
		[getAvailableVersionsToAdd],
	)

	// Legacy support - first two versions for backward compatibility
	const leftVersion = compareVersions[0] || "cbt-phase-1"
	const rightVersion = compareVersions[1] || "legacy"

	const setLeftVersion = useCallback(
		(version: DataVersion) => {
			setVersionAtIndex(0, version)
		},
		[setVersionAtIndex],
	)

	const setRightVersion = useCallback(
		(version: DataVersion) => {
			setVersionAtIndex(1, version)
		},
		[setVersionAtIndex],
	)

	const value = {
		isCompareMode: mounted ? isCompareMode : false,
		setCompareMode,
		toggleCompareMode,
		compareVersions: mounted ? compareVersions : (["cbt-phase-1", "legacy"] as DataVersion[]),
		addVersion,
		removeVersion,
		setVersionAtIndex,
		swapVersions,
		getAvailableVersionsToAdd,
		canAddMore,
		isHydrated: mounted,
		// Legacy support
		leftVersion: mounted ? leftVersion : "cbt-phase-1",
		rightVersion: mounted ? rightVersion : "legacy",
		setLeftVersion,
		setRightVersion,
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
