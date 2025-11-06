"use client"

import { useEffect, useRef } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

export function RecordingHandler({
	isRecording,
	onRecordingComplete,
}: {
	isRecording: boolean
	onRecordingComplete: ((blob: Blob) => void) | null
}) {
	const { gl, scene } = useThree()
	const mediaRecorderRef = useRef<MediaRecorder | null>(null)
	const chunksRef = useRef<Blob[]>([])
	const gridHelperRef = useRef<THREE.Object3D | null>(null)

	useEffect(() => {
		if (isRecording && !mediaRecorderRef.current) {
			// Find and hide the grid helper for recording
			scene.traverse((child) => {
				if (child.type === "GridHelper") {
					gridHelperRef.current = child
					child.visible = false
				}
			})

			// Start recording
			try {
				const stream = gl.domElement.captureStream(30) // 30 fps
				const mediaRecorder = new MediaRecorder(stream, {
					mimeType: "video/webm;codecs=vp9",
				})

				chunksRef.current = []

				mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) {
						chunksRef.current.push(event.data)
					}
				}

				mediaRecorder.onstop = () => {
					const blob = new Blob(chunksRef.current, { type: "video/webm" })
					if (onRecordingComplete) {
						onRecordingComplete(blob)
					}
					chunksRef.current = []
					mediaRecorderRef.current = null

					// Restore grid visibility when recording stops
					if (gridHelperRef.current) {
						gridHelperRef.current.visible = true
						gridHelperRef.current = null
					}
				}

				mediaRecorder.start()
				mediaRecorderRef.current = mediaRecorder
			} catch (error) {
				console.error("Failed to start recording:", error)
				// Restore grid visibility on error
				if (gridHelperRef.current) {
					gridHelperRef.current.visible = true
					gridHelperRef.current = null
				}
			}
		} else if (!isRecording && mediaRecorderRef.current) {
			// Stop recording
			mediaRecorderRef.current.stop()
		}
	}, [isRecording, gl, scene, onRecordingComplete])

	return null
}
