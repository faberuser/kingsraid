"use client"

import { useEffect, useState } from "react"

interface NetworkInfo {
	isSlowConnection: boolean
	connectionType: string
	effectiveType: string | undefined
}

export function useNetworkInfo(): NetworkInfo {
	const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
		isSlowConnection: false,
		connectionType: "unknown",
		effectiveType: undefined,
	})

	useEffect(() => {
		// Check if we're in a browser environment
		if (typeof window === "undefined") {
			return
		}

		const updateNetworkInfo = () => {
			// Type assertion for navigator with connection property
			const nav = navigator as Navigator & {
				connection?: {
					effectiveType?: "slow-2g" | "2g" | "3g" | "4g"
					type?: string
					saveData?: boolean
				}
				mozConnection?: {
					effectiveType?: "slow-2g" | "2g" | "3g" | "4g"
					type?: string
					saveData?: boolean
				}
				webkitConnection?: {
					effectiveType?: "slow-2g" | "2g" | "3g" | "4g"
					type?: string
					saveData?: boolean
				}
			}

			const connection = nav.connection || nav.mozConnection || nav.webkitConnection

			if (connection) {
				const effectiveType = connection.effectiveType
				const type = connection.type || "unknown"
				const saveData = connection.saveData || false

				// Consider slow if:
				// 1. Effective type is slow-2g, 2g, or 3g
				// 2. Type is cellular
				// 3. Save data mode is enabled
				const isSlowConnection =
					effectiveType === "slow-2g" ||
					effectiveType === "2g" ||
					effectiveType === "3g" ||
					type === "cellular" ||
					saveData

				setNetworkInfo({
					isSlowConnection,
					connectionType: type,
					effectiveType,
				})
			} else {
				// If Network Information API is not available, default to false
				setNetworkInfo({
					isSlowConnection: false,
					connectionType: "unknown",
					effectiveType: undefined,
				})
			}
		}

		updateNetworkInfo()

		// Listen for connection changes
		const nav = navigator as Navigator & {
			connection?: EventTarget
			mozConnection?: EventTarget
			webkitConnection?: EventTarget
		}

		const connection = nav.connection || nav.mozConnection || nav.webkitConnection

		if (connection) {
			connection.addEventListener("change", updateNetworkInfo)

			return () => {
				connection.removeEventListener("change", updateNetworkInfo)
			}
		}
	}, [])

	return networkInfo
}
