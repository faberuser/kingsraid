"use client"

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useId } from "react"
import { DataVersion, DATA_VERSIONS } from "@/lib/constants"

interface ToggleConfig {
	id: string
	showToggle: boolean
	versions: DataVersion[]
}

interface HeroToggleContextType {
	showToggle: boolean
	availableVersions: DataVersion[]
	registerToggle: (config: ToggleConfig) => void
	unregisterToggle: (id: string) => void
}

const HeroToggleContext = createContext<HeroToggleContextType | undefined>(undefined)

export function HeroToggleProvider({ children }: { children: ReactNode }) {
	const [configs, setConfigs] = useState<ToggleConfig[]>([])

	const registerToggle = useCallback((config: ToggleConfig) => {
		setConfigs((prev) => {
			const filtered = prev.filter((c) => c.id !== config.id)
			return [...filtered, config]
		})
	}, [])

	const unregisterToggle = useCallback((id: string) => {
		setConfigs((prev) => prev.filter((c) => c.id !== id))
	}, [])

	const activeConfig = configs.length > 0 ? configs[configs.length - 1] : null

	return (
		<HeroToggleContext.Provider
			value={{
				showToggle: activeConfig ? activeConfig.showToggle : false,
				availableVersions: activeConfig ? activeConfig.versions : [...DATA_VERSIONS],
				registerToggle,
				unregisterToggle,
			}}
		>
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
	const { registerToggle, unregisterToggle } = useHeroToggle()
	const id = useId()
	const versionsList = versions.join(",")

	useEffect(() => {
		const availableVersions = versionsList === "" ? [] : (versionsList.split(",") as DataVersion[])
		registerToggle({ id, showToggle, versions: availableVersions })
		return () => unregisterToggle(id)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [versionsList, showToggle, registerToggle, unregisterToggle])
}
