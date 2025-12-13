"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"

const SIDEBAR_STORAGE_KEY = "sidebar:state"

function getInitialState(): boolean {
	if (typeof window === "undefined") return true
	const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
	return stored !== null ? stored === "true" : true
}

export default function SidebarProviderWithStorage({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(getInitialState)
	const [isLoaded, setIsLoaded] = useState(false)

	// Mark as loaded after mount
	useEffect(() => {
		const timer = setTimeout(() => setIsLoaded(true), 0)
		return () => clearTimeout(timer)
	}, [])

	// Save to localStorage whenever state changes
	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newOpen))
	}

	// Prevent hydration mismatch by not rendering until mounted
	if (!isLoaded) {
		return null
	}

	return (
		<SidebarProvider open={open} onOpenChange={handleOpenChange}>
			{children}
		</SidebarProvider>
	)
}
