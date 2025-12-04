"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Model } from "@/components/models/Model"
import { Scene } from "@/components/models/Scene"
import { ScreenshotHandler } from "@/components/models/ScreenshotHandler"
import { RecordingHandler } from "@/components/models/RecordingHandler"
import { ScreenshotDialog } from "@/components/models/ScreenshotDialog"
import { RecordingDialog } from "@/components/models/RecordingDialog"
import { ControlsPanel } from "@/components/models/ControlsPanel"
import { CameraControls } from "@/components/models/CameraControls"
import { convertToGif } from "@/components/models/gifConverter"
import { formatAnimationName } from "@/components/models/utils"
import {
	ModelViewerProps,
	INITIAL_CAMERA_POSITION,
	INITIAL_CAMERA_TARGET,
	weaponTypes,
} from "@/components/models/types"

export function ModelViewer({
	modelFiles,
	availableAnimations,
	selectedAnimation,
	setSelectedAnimation,
	isLoading,
	setIsLoading,
	availableScenes = [],
	visibleModels: externalVisibleModels,
	setVisibleModels: externalSetVisibleModels,
	modelType = "heroes",
	bossName,
}: ModelViewerProps) {
	const [internalVisibleModels, setInternalVisibleModels] = useState<Set<string>>(new Set())

	// Use external state if provided, otherwise use internal state
	const visibleModels = externalVisibleModels ?? internalVisibleModels
	const setVisibleModels = externalSetVisibleModels ?? setInternalVisibleModels
	const [isPaused, setIsPaused] = useState(false)
	const [loadingProgress, setLoadingProgress] = useState(0)
	const [isCollapsed, setIsCollapsed] = useState(false)
	const [selectedScene, setSelectedScene] = useState<string>("grid")
	const [screenshotDialog, setScreenshotDialog] = useState(false)
	const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
	const [captureCallback, setCaptureCallback] = useState<((dataUrl: string) => void) | null>(null)
	const [isRecording, setIsRecording] = useState(false)
	const [recordingDialog, setRecordingDialog] = useState(false)
	const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
	const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
	const [animationDuration, setAnimationDuration] = useState<number>(0)
	const [isExportingAnimation, setIsExportingAnimation] = useState(false)
	const [downloadFormat, setDownloadFormat] = useState<"webm" | "mp4" | "gif">("webm")
	const [isConverting, setIsConverting] = useState(false)
	const controlsRef = useRef<OrbitControlsImpl>(null)
	const cameraRef = useRef<THREE.PerspectiveCamera>(null)

	useEffect(() => {
		// Show non-weapons and weapons with defaultPosition === true by default
		// For bosses, also show all weapons by default
		if (modelFiles.length > 0) {
			setIsLoading(true)
			setLoadingProgress(0)
			const modelNames = modelFiles
				.filter(
					(m) =>
						!weaponTypes.includes(m.type) || // Non-weapons
						(weaponTypes.includes(m.type) && m.defaultPosition === true) || // Default position weapons
						(modelType === "bosses" && weaponTypes.includes(m.type)) // All boss weapons
				)
				.map((m) => m.name)

			setVisibleModels(new Set(modelNames))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modelFiles, modelType]) // Removed setIsLoading and setVisibleModels - they're stable functions

	const resetCamera = () => {
		if (cameraRef.current) {
			cameraRef.current.position.set(...INITIAL_CAMERA_POSITION)
			cameraRef.current.updateProjectionMatrix()
		}
		if (controlsRef.current) {
			controlsRef.current.target.set(...INITIAL_CAMERA_TARGET)
			controlsRef.current.update()
		}
	}

	const toggleModelVisibility = (modelName: string) => {
		setVisibleModels((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(modelName)) {
				newSet.delete(modelName)
			} else {
				newSet.add(modelName)
			}
			return newSet
		})
	}

	const captureScreenshot = () => {
		// Set the capture callback which will trigger the ScreenshotHandler
		setCaptureCallback(() => (dataUrl: string) => {
			setScreenshotUrl(dataUrl)
			setScreenshotDialog(true)
			setCaptureCallback(null) // Reset after capture
		})
	}

	const downloadScreenshot = () => {
		if (!screenshotUrl) return

		const link = document.createElement("a")
		link.download = `model-screenshot-${Date.now()}.png`
		link.href = screenshotUrl
		link.click()
		setScreenshotDialog(false)
	}

	const copyToClipboard = async () => {
		if (!screenshotUrl) return

		try {
			// Convert data URL to blob
			const response = await fetch(screenshotUrl)
			const blob = await response.blob()

			// Copy to clipboard
			await navigator.clipboard.write([
				new ClipboardItem({
					"image/png": blob,
				}),
			])

			setScreenshotDialog(false)
		} catch (error) {
			console.error("Failed to copy to clipboard:", error)
		}
	}

	const toggleRecording = () => {
		setIsRecording(!isRecording)
	}

	const handleRecordingComplete = (blob: Blob) => {
		setRecordingBlob(blob)
		const url = URL.createObjectURL(blob)
		setRecordingUrl(url)
		setRecordingDialog(true)
	}

	const downloadRecording = async () => {
		if (!recordingBlob) return

		setIsConverting(true)

		try {
			let downloadBlob = recordingBlob
			let extension = "webm"

			if (downloadFormat === "mp4") {
				// For MP4, we'll use the WebM directly but with mp4 extension
				// Modern browsers can handle WebM in MP4 container
				extension = "mp4"
			} else if (downloadFormat === "gif") {
				// Convert to GIF using canvas and gif.js approach
				downloadBlob = await convertToGif(recordingUrl!)
				extension = "gif"
			}

			const link = document.createElement("a")
			link.download = `model-animation-${Date.now()}.${extension}`
			link.href = URL.createObjectURL(downloadBlob)
			link.click()
			URL.revokeObjectURL(link.href)

			setRecordingDialog(false)
		} catch (error) {
			console.error("Failed to convert/download recording:", error)
			alert("Failed to convert video. Please try a different format.")
		} finally {
			setIsConverting(false)
		}
	}

	const closeRecordingDialog = () => {
		setRecordingDialog(false)
		if (recordingUrl) {
			URL.revokeObjectURL(recordingUrl)
			setRecordingUrl(null)
		}
		setRecordingBlob(null)
	}

	const exportAnimation = () => {
		if (!selectedAnimation || animationDuration === 0) {
			return
		}

		// Start recording
		setIsExportingAnimation(true)
		setIsRecording(true)

		// Stop recording after animation duration (plus a small buffer)
		setTimeout(() => {
			setIsRecording(false)
			setIsExportingAnimation(false)
		}, (animationDuration + 0.1) * 1000) // Add 100ms buffer
	}

	return (
		<Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
			<div className="space-y-4 flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-200 lg:max-h-200">
				{/* 3D Viewer */}
				<div className="relative w-full h-200 lg:h-auto bg-gradient-to-b from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
					{/* Sliding Controls Panel - slides in from left */}
					<ControlsPanel
						isCollapsed={isCollapsed}
						isLoading={isLoading}
						selectedScene={selectedScene}
						setSelectedScene={setSelectedScene}
						availableScenes={availableScenes}
						modelFiles={modelFiles}
						visibleModels={visibleModels}
						toggleModelVisibility={toggleModelVisibility}
						availableAnimations={availableAnimations}
						selectedAnimation={selectedAnimation}
						setSelectedAnimation={setSelectedAnimation}
						isPaused={isPaused}
						setIsPaused={setIsPaused}
					/>

					{/* Collapse Toggle Button - moves with the panel */}
					<CollapsibleTrigger asChild>
						<Button
							variant="secondary"
							size="sm"
							className="absolute top-1/2 -translate-y-1/2 z-20 h-16 w-6 p-0 shadow-lg rounded-l-none rounded-r-lg transition-all duration-300 ease-in-out"
							style={{
								left: isCollapsed ? "0px" : "208px",
							}}
							title={isCollapsed ? "Show controls" : "Hide controls"}
							disabled={isLoading}
						>
							{isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
						</Button>
					</CollapsibleTrigger>

					<Canvas shadows gl={{ toneMapping: THREE.NoToneMapping }} resize={{ polyfill: ResizeObserver }}>
						<PerspectiveCamera ref={cameraRef} makeDefault position={INITIAL_CAMERA_POSITION} />
						<OrbitControls
							ref={controlsRef}
							enablePan={true}
							enableZoom={true}
							enableRotate={true}
							maxDistance={20}
							minDistance={0}
							target={INITIAL_CAMERA_TARGET}
						/>
						{/* Lighting setup */}
						<ambientLight intensity={3} />
						<directionalLight
							position={[0, 10, 0]}
							intensity={1}
							castShadow
							shadow-mapSize={2048}
							shadow-camera-far={50}
							shadow-camera-left={-10}
							shadow-camera-right={10}
							shadow-camera-top={10}
							shadow-camera-bottom={-10}
						/>
						<Suspense fallback={null}>
							<Model
								modelFiles={modelFiles}
								visibleModels={visibleModels}
								setVisibleModels={setVisibleModels}
								selectedAnimation={selectedAnimation}
								isPaused={isPaused}
								setIsLoading={setIsLoading}
								setLoadingProgress={setLoadingProgress}
								onAnimationDurationChange={setAnimationDuration}
								modelType={modelType}
								bossName={bossName}
							/>
							{selectedScene === "grid" ? (
								<gridHelper args={[10, 10]} />
							) : (
								<Scene sceneName={selectedScene} />
							)}
							<ScreenshotHandler onCapture={captureCallback} />
							<RecordingHandler isRecording={isRecording} onRecordingComplete={handleRecordingComplete} />
						</Suspense>
					</Canvas>

					{/* Camera Controls */}
					<CameraControls
						isLoading={isLoading}
						resetCamera={resetCamera}
						captureScreenshot={captureScreenshot}
						isRecording={isRecording}
						isExportingAnimation={isExportingAnimation}
						toggleRecording={toggleRecording}
						exportAnimation={exportAnimation}
						selectedAnimation={selectedAnimation}
						animationDuration={animationDuration}
					/>

					{/* Models count */}
					{modelFiles.some((m) => visibleModels.has(m.name)) && (
						<div className="absolute bottom-4 left-4 space-y-1">
							<div className="bg-black/50 text-white px-2 py-1 rounded text-sm">
								Models: {Array.from(visibleModels).length}/{modelFiles.length}
							</div>
							{selectedAnimation && (
								<div className="bg-black/50 text-white px-2 py-1 rounded text-sm">
									Animation: {formatAnimationName(selectedAnimation)}
								</div>
							)}
							{isRecording && (
								<div className="bg-red-600 text-white px-2 py-1 rounded text-sm flex items-center gap-2 animate-pulse">
									<div className="w-2 h-2 bg-white rounded-full" />
									{isExportingAnimation ? "Exporting Animation..." : "Recording..."}
								</div>
							)}
						</div>
					)}

					{/* Loading overlay */}
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
							<div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg min-w-72 max-w-md flex flex-row items-center gap-3">
								<Progress value={loadingProgress} className="h-2" />
								<div className="text-xs text-muted-foreground text-right mb-0.5">
									{Math.round(loadingProgress)}%
								</div>
							</div>
						</div>
					)}

					{/* Screenshot Dialog */}
					<ScreenshotDialog
						open={screenshotDialog}
						onOpenChange={setScreenshotDialog}
						screenshotUrl={screenshotUrl}
						onDownload={downloadScreenshot}
						onCopyToClipboard={copyToClipboard}
					/>

					{/* Recording Dialog */}
					<RecordingDialog
						open={recordingDialog}
						onOpenChange={closeRecordingDialog}
						recordingUrl={recordingUrl}
						downloadFormat={downloadFormat}
						setDownloadFormat={setDownloadFormat}
						onDownload={downloadRecording}
						isConverting={isConverting}
					/>
				</div>
			</div>
		</Collapsible>
	)
}
