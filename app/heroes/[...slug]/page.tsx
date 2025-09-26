"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function SlugPage() {
	const [isLoading, setIsLoading] = useState(false)
	const [currentPath, setCurrentPath] = useState("")
	const [searchResults, setSearchResults] = useState([])

	const pathname = usePathname()
	const router = useRouter()

	// set current path on load
	useEffect(() => {
		setCurrentPath(pathname === "/" ? "" : decodeURIComponent(pathname ?? ""))
	}, [pathname])

	// listen to back/forward button
	useEffect(() => {
		const handlePopState = () => {
			setCurrentPath(window.location.pathname === "/" ? "" : decodeURIComponent(window.location.pathname ?? ""))
		}

		window.addEventListener("popstate", handlePopState)
		return () => {
			window.removeEventListener("popstate", handlePopState)
		}
	}, [])

	function setNewPath(_path: string) {
		setCurrentPath(_path)
		const navigateTo = _path === "" ? "/" : _path
		router.push(navigateTo)
	}

	return <div className="p-4">TEST</div>
}
