"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

export function ScreenshotHandler({ onCapture }: { onCapture: ((dataUrl: string) => void) | null }) {
	const { gl, scene } = useThree()

	useEffect(() => {
		if (onCapture) {
			// Find and temporarily hide the grid helper
			let gridHelper: THREE.Object3D | null = null
			scene.traverse((child) => {
				if (child.type === "GridHelper") {
					gridHelper = child
					child.visible = false
				}
			})

			// Render one frame and capture
			requestAnimationFrame(() => {
				try {
					const dataUrl = gl.domElement.toDataURL("image/png")
					onCapture(dataUrl)
				} catch (error) {
					console.error("Failed to capture screenshot:", error)
				} finally {
					// Restore grid visibility
					if (gridHelper) {
						gridHelper.visible = true
					}
				}
			})
		}
	}, [onCapture, gl, scene])

	return null
}
