"use client"

import { useEffect, useRef } from "react"
import { useThree } from "@react-three/fiber"

export function RecordingHandler({
	isRecording,
	onRecordingComplete,
}: {
	isRecording: boolean
	onRecordingComplete: ((blob: Blob) => void) | null
}) {
	const { gl } = useThree()
	const mediaRecorderRef = useRef<MediaRecorder | null>(null)
	const chunksRef = useRef<Blob[]>([])

	useEffect(() => {
		if (isRecording && !mediaRecorderRef.current) {
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
				}

				mediaRecorder.start()
				mediaRecorderRef.current = mediaRecorder
			} catch (error) {
				console.error("Failed to start recording:", error)
			}
		} else if (!isRecording && mediaRecorderRef.current) {
			// Stop recording
			mediaRecorderRef.current.stop()
		}
	}, [isRecording, gl, onRecordingComplete])

	return null
}
