"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"

export function ScreenshotHandler({ onCapture }: { onCapture: ((dataUrl: string) => void) | null }) {
	const { gl } = useThree()

	useEffect(() => {
		if (onCapture) {
			// Render one frame and capture
			requestAnimationFrame(() => {
				try {
					const dataUrl = gl.domElement.toDataURL("image/png")
					onCapture(dataUrl)
				} catch (error) {
					console.error("Failed to capture screenshot:", error)
				}
			})
		}
	}, [onCapture, gl])

	return null
}
