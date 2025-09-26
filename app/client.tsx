"use client"

import { useState, useEffect } from "react"

import { SidebarProvider } from "@/components/ui/sidebar"

import AppSidebar from "@/components/app-sidebar"

export default function Client({ title }: any) {
	const [isLoading, setIsLoading] = useState(false)
	const [currentPath, setCurrentPath] = useState("")
	const [searchResults, setSearchResults] = useState([])

	useEffect(() => {
		const handlePopState = (event?: PopStateEvent) => {
			setCurrentPath(window.location.pathname === "/" ? "" : decodeURIComponent(window.location.pathname))
		}
		handlePopState()
		window.addEventListener("popstate", handlePopState)
		return () => {
			window.removeEventListener("popstate", handlePopState)
		}
	}, [])

	function setNewPath(_path: any) {
		setCurrentPath(_path)
		if (_path == "") {
			_path = "/"
		}
		window.history.pushState(null, "", _path)
	}

	return (
		<div className="flex h-screen w-full">
			<SidebarProvider>
				<AppSidebar setNewPath={setNewPath} title={title} />
			</SidebarProvider>
		</div>
	)
}
