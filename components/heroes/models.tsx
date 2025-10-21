"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { FBXLoader } from "three-stdlib"
import * as THREE from "three"
import { HeroData } from "@/model/Hero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
	RotateCcw,
	Info,
	Eye,
	EyeOff,
	Play,
	Pause,
	ChevronLeft,
	ChevronRight,
	Camera,
	Download,
	Copy,
} from "lucide-react"
import { ModelFile } from "@/model/Hero_Model"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

// Suppress THREE.js PropertyBinding warnings for missing bones
const originalWarn = console.warn
console.warn = function (...args) {
	const message = args[0]
	if (typeof message === "string" && message.includes("THREE.PropertyBinding: No target node found")) {
		return
	}
	originalWarn.apply(console, args)
}

const weaponTypes = [
	"handle",
	"weapon",
	"weapon01",
	"weapon02",
	"weapon_blue",
	"weapon_red",
	"weapon_open",
	"weapon_close",
	"weapon_a",
	"weapon_b",
	"weapona",
	"weaponb",
	"weapon_r",
	"weapon_l",
	"weaponr",
	"weaponl",
	"weaponbottle",
	"weaponpen",
	"weaponscissors",
	"weaponskein",
	"shield",
	"sword",
	"lance",
	"gunblade",
	"axe",
	"arrow",
	"quiver",
	"sheath",
	"bag",
]

interface ModelsProps {
	heroData: HeroData
	heroModels: { [costume: string]: ModelFile[] }
}

type HeroModel = THREE.Group & {
	mixer?: THREE.AnimationMixer
	animations?: THREE.AnimationClip[]
}

function Model({
	modelFiles,
	visibleModels,
	selectedAnimation,
	isPaused,
	setIsLoading,
	setLoadingProgress,
}: {
	modelFiles: ModelFile[]
	visibleModels: Set<string>
	selectedAnimation: string | null
	isPaused?: boolean
	setIsLoading?: (loading: boolean) => void
	setLoadingProgress?: (progress: number) => void
}) {
	const groupRef = useRef<THREE.Group>(null)
	const [loadedModels, setLoadedModels] = useState<Map<string, HeroModel>>(new Map())
	const mixersRef = useRef<Map<string, THREE.AnimationMixer>>(new Map())
	const activeActionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map())
	const sharedAnimationsRef = useRef<THREE.AnimationClip[]>([])

	useEffect(() => {
		const loadModel = async (modelFile: ModelFile, modelIndex: number, totalModels: number) => {
			if (loadedModels.has(modelFile.name)) return
			const modelDir = `${basePath}/kingsraid-models/models/heroes`

			try {
				const fbxLoader = new FBXLoader()

				// Load FBX model with progress tracking
				const fbx = await new Promise<THREE.Group>((resolve, reject) => {
					fbxLoader.load(
						`${modelDir}/${modelFile.path}`,
						resolve,
						(xhr) => {
							// Calculate progress for this individual model
							const modelProgress = xhr.total > 0 ? (xhr.loaded / xhr.total) * 100 : 0
							// Calculate overall progress considering all models
							const previousModelsProgress = (modelIndex / totalModels) * 100
							const currentModelContribution = (1 / totalModels) * 100
							const totalProgress =
								previousModelsProgress + (modelProgress / 100) * currentModelContribution
							if (setLoadingProgress) {
								setLoadingProgress(totalProgress)
							}
						},
						reject
					)
				})

				const modelWithAnimations = fbx as HeroModel
				modelWithAnimations.animations = fbx.animations || []

				// Bind skeleton for skinned meshes (crucial for AssetStudio FBX files)
				fbx.traverse((child) => {
					if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
						const skinnedMesh = child as THREE.SkinnedMesh
						if (skinnedMesh.skeleton) {
							skinnedMesh.bind(skinnedMesh.skeleton)
						}
					}
				})

				// Fix materials
				fbx.traverse((child) => {
					if ((child as THREE.Mesh).isMesh) {
						const mesh = child as THREE.Mesh
						if (mesh.material) {
							const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

							materials.forEach((material, index) => {
								// Type guard to check if material has map property
								let name = "unknown"
								let originalMap = null
								let color = new THREE.Color(0xcccccc)
								let opacity = 1.0

								if (
									material instanceof THREE.MeshStandardMaterial ||
									material instanceof THREE.MeshPhongMaterial ||
									material instanceof THREE.MeshLambertMaterial ||
									material instanceof THREE.MeshBasicMaterial ||
									material instanceof THREE.MeshToonMaterial
								) {
									name = material.name || "unnamed"
									originalMap = material.map
									color = material.color || new THREE.Color(0xcccccc)
									opacity = material.opacity
								}

								if (opacity === 0) {
									// Use appropriate material with transparency for invisible materials
									const transparentMaterial = new THREE.MeshBasicMaterial({
										name: name,
										transparent: true,
										opacity: 0,
										visible: false,
									})

									if (Array.isArray(mesh.material)) {
										mesh.material[index] = transparentMaterial
									} else {
										mesh.material = transparentMaterial
									}
								} else {
									const newMaterial = new THREE.MeshBasicMaterial({
										name: name,
										map: originalMap,
										...(originalMap ? {} : { color: color }),
										...(opacity < 1 ? { transparent: true, opacity: opacity } : {}),
									})

									if (Array.isArray(mesh.material)) {
										mesh.material[index] = newMaterial
									} else {
										mesh.material = newMaterial
									}
								}
							})

							// Update material if it's an array
							if (Array.isArray(mesh.material)) {
								mesh.material = [...mesh.material]
							}
						}
						mesh.castShadow = true
						mesh.receiveShadow = true
						mesh.frustumCulled = false
					}
				})

				if (
					modelFile.type === "body" ||
					modelFile.type === "arms" ||
					modelFile.type === "arm" ||
					modelFile.type === "hair" ||
					modelFile.type === "mask"
				) {
					fbx.position.set(0, 0, 0)
				} else if (weaponTypes.includes(modelFile.type)) {
					if (!modelFile.defaultPosition) {
						fbx.position.set(1, 0, 0)
					}
				} else {
					// Default positioning for unknown types
					fbx.position.set(0, 0, 0)
				}

				// Store shared animations from the first model that has them
				if (modelWithAnimations.animations.length > 0 && sharedAnimationsRef.current.length === 0) {
					sharedAnimationsRef.current = modelWithAnimations.animations
				}

				// Always create a mixer for every model
				const mixer = new THREE.AnimationMixer(modelWithAnimations)
				modelWithAnimations.mixer = mixer
				mixersRef.current.set(modelFile.name, mixer)

				setLoadedModels((prev) => new Map(prev).set(modelFile.name, modelWithAnimations))
			} catch (error) {
				console.error(`Failed to load model ${modelFile.name}:`, error)
			}
		}

		// Load models sequentially: body first to ensure animations are available
		const loadModelsSequentially = async () => {
			if (setIsLoading) setIsLoading(true)
			if (setLoadingProgress) setLoadingProgress(0)

			// Sort models to load body first (most important for animations), then others
			const sortedModels = [...modelFiles].sort((a, b) => {
				if (a.type === "body") return -1
				if (b.type === "body") return 1
				// Also prioritize arms/hair after body as they may contain animations
				if (a.type === "arms" || a.type === "arm") return -1
				if (b.type === "arms" || b.type === "arm") return 1
				return 0
			})

			const visibleModelsToLoad = sortedModels.filter((m) => visibleModels.has(m.name))
			const totalModels = visibleModelsToLoad.length

			for (let i = 0; i < visibleModelsToLoad.length; i++) {
				await loadModel(visibleModelsToLoad[i], i, totalModels)
			}

			if (setIsLoading) setIsLoading(false)
		}

		loadModelsSequentially()
	}, [modelFiles, visibleModels])

	// Handle animation switching
	useEffect(() => {
		// Wait a bit to ensure all models have loaded and shared animations are available
		const timeoutId = setTimeout(() => {
			loadedModels.forEach((model, modelName) => {
				const mixer = mixersRef.current.get(modelName)
				if (!mixer) return

				// Stop all current actions
				const currentAction = activeActionsRef.current.get(modelName)
				if (currentAction) {
					currentAction.fadeOut(0.3)
				}

				// Play selected animation
				if (selectedAnimation) {
					// Try to find animation in model's animations first, then in shared animations
					const animations =
						model.animations && model.animations.length > 0 ? model.animations : sharedAnimationsRef.current

					const clip = animations.find((c) => c.name === selectedAnimation)
					if (clip) {
						const action = mixer.clipAction(clip)
						action.reset().fadeIn(0.3).play()
						activeActionsRef.current.set(modelName, action)
					}
				}
			})
		}, 100)

		return () => clearTimeout(timeoutId)
	}, [selectedAnimation, loadedModels])

	useFrame((state, delta) => {
		if (!isPaused) {
			mixersRef.current.forEach((mixer) => mixer.update(delta))
		}
	})

	useEffect(() => {
		return () => {
			mixersRef.current.forEach((mixer) => mixer.stopAllAction())
			mixersRef.current.clear()
		}
	}, [])

	return (
		<group ref={groupRef}>
			{Array.from(loadedModels.entries()).map(([name, model]) =>
				visibleModels.has(name) ? <primitive key={name} object={model} /> : null
			)}
		</group>
	)
}

function Scene({ sceneName }: { sceneName: string | null }) {
	const [sceneModel, setSceneModel] = useState<THREE.Group | null>(null)

	useEffect(() => {
		if (!sceneName || sceneName === "grid") {
			setSceneModel(null)
			return
		}

		const loadScene = async () => {
			const fbxLoader = new FBXLoader()
			const scenePath = `${basePath}/kingsraid-models/scenes/${sceneName}/${
				sceneName.charAt(0).toUpperCase() + sceneName.slice(1)
			}.fbx`

			try {
				const fbx = await new Promise<THREE.Group>((resolve, reject) => {
					fbxLoader.load(scenePath, resolve, undefined, reject)
				})

				// Fix materials and textures
				fbx.traverse((child) => {
					if ((child as THREE.Mesh).isMesh) {
						const mesh = child as THREE.Mesh
						if (mesh.material) {
							const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

							materials.forEach((material, index) => {
								let name = "unknown"
								let originalMap = null
								let color = new THREE.Color(0xcccccc)
								let opacity = 1.0

								if (
									material instanceof THREE.MeshStandardMaterial ||
									material instanceof THREE.MeshPhongMaterial ||
									material instanceof THREE.MeshLambertMaterial ||
									material instanceof THREE.MeshBasicMaterial ||
									material instanceof THREE.MeshToonMaterial
								) {
									name = material.name || "unnamed"
									originalMap = material.map
									color = material.color || new THREE.Color(0xcccccc)
									opacity = material.opacity
								}

								const newMaterial = new THREE.MeshStandardMaterial({
									name: name,
									map: originalMap,
									...(originalMap ? {} : { color: color }),
									...(opacity < 1 ? { transparent: true, opacity: opacity } : {}),
									roughness: 1,
									metalness: 0.0,
								})

								if (Array.isArray(mesh.material)) {
									mesh.material[index] = newMaterial
								} else {
									mesh.material = newMaterial
								}
							})

							if (Array.isArray(mesh.material)) {
								mesh.material = [...mesh.material]
							}
						}
						mesh.castShadow = false
						mesh.receiveShadow = true
						mesh.frustumCulled = false
					}
				})

				setSceneModel(fbx)
			} catch (error) {
				console.error(`Failed to load scene ${sceneName}:`, error)
				setSceneModel(null)
			}
		}

		loadScene()
	}, [sceneName])

	if (!sceneModel) return null

	return <primitive object={sceneModel} />
}

function ModelViewer({
	modelFiles,
	availableAnimations,
	selectedAnimation,
	setSelectedAnimation,
	isLoading,
	setIsLoading,
}: {
	modelFiles: ModelFile[]
	availableAnimations: string[]
	selectedAnimation: string | null
	setSelectedAnimation: (s: string | null) => void
	isLoading: boolean
	setIsLoading: (loading: boolean) => void
}) {
	const INITIAL_CAMERA_POSITION: [number, number, number] = [0, 1, 3]
	const INITIAL_CAMERA_TARGET: [number, number, number] = [0, 1, 0]

	const [visibleModels, setVisibleModels] = useState<Set<string>>(new Set())
	const [isPaused, setIsPaused] = useState(false)
	const [loadingProgress, setLoadingProgress] = useState(0)
	const [isCollapsed, setIsCollapsed] = useState(false)
	const [selectedScene, setSelectedScene] = useState<string>("grid")
	const [screenshotDialog, setScreenshotDialog] = useState(false)
	const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)

	const controlsRef = useRef<any>(null)
	const cameraRef = useRef<THREE.PerspectiveCamera>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)

	// Available scenes (can be expanded by scanning the scenes directory)
	const availableScenes = [
		{ value: "grid", label: "Grid" },
		{ value: "wardrobe", label: "Wardrobe" },
	]

	useEffect(() => {
		// Show non-weapons and weapons with defaultPosition === true by default
		if (modelFiles.length > 0) {
			setIsLoading(true)
			const modelNames = modelFiles
				.filter(
					(m) => !weaponTypes.includes(m.type) || (weaponTypes.includes(m.type) && m.defaultPosition === true)
				)
				.map((m) => m.name)
			setVisibleModels(new Set(modelNames))
		}
	}, [modelFiles])

	// Format animation name for display
	const formatAnimationName = (animName: string): string => {
		// Remove hero name prefix (e.g., "Hero_Aisha@Run_Run" -> "Run_Run")
		let formatted = animName.split("@")[1] || animName

		// Remove repeated prefix (e.g., "Attack1_Attack1-1" -> "Attack1-1", "Cos20SL_Cos20SL_1" -> "Cos20SL_1")
		const parts = formatted.split("_")
		if (parts.length > 1 && parts[1].startsWith(parts[0])) {
			formatted = [parts[1], ...parts.slice(2)].join("_")
		}

		// Capitalize first letter
		return formatted.charAt(0).toUpperCase() + formatted.slice(1)
	}

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
		if (!canvasRef.current) return

		try {
			// Get the canvas data URL
			const dataUrl = canvasRef.current.toDataURL("image/png")
			setScreenshotUrl(dataUrl)
			setScreenshotDialog(true)
		} catch (error) {
			console.error("Failed to capture screenshot:", error)
		}
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

	return (
		<Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
			<div className="space-y-4 flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-200 lg:max-h-200">
				{/* 3D Viewer */}
				<div className="relative w-full h-200 lg:h-auto bg-gradient-to-b from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
					{/* Sliding Controls Panel - slides in from left */}
					<div
						className="absolute top-0 h-full z-10 bg-background/95 backdrop-blur-sm border-r shadow-xl p-4 overflow-y-auto flex flex-col gap-4 w-52 transition-all duration-300 ease-in-out"
						style={{
							left: isCollapsed ? "-208px" : "0px",
						}}
					>
						{/* Scene Selection */}
						<div className="space-y-2 flex-shrink-0">
							<Select value={selectedScene} onValueChange={setSelectedScene} disabled={isLoading}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select scene" />
								</SelectTrigger>
								<SelectContent>
									{availableScenes.map((scene) => (
										<SelectItem key={scene.value} value={scene.value}>
											{scene.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Separator className="flex-shrink-0" />

						{/* Individual Model Toggles */}
						<div className="flex flex-col items-center gap-2 flex-shrink-0">
							{Array.from(new Map(modelFiles.map((model) => [model.name, model])).values())
								.sort((a, b) => a.name.localeCompare(b.name))
								.map((model) => (
									<Button
										key={model.name}
										size="sm"
										variant={visibleModels.has(model.name) ? "default" : "outline"}
										onClick={() => toggleModelVisibility(model.name)}
										className="flex items-center gap-2 w-full"
										disabled={isLoading}
									>
										{visibleModels.has(model.name) ? (
											<Eye className="h-3 w-3" />
										) : (
											<EyeOff className="h-3 w-3" />
										)}
										<span className="capitalize">{model.type}</span>
									</Button>
								))}
						</div>

						{/* Animation Selection */}
						{availableAnimations.length > 0 && (
							<>
								<Separator className="flex-shrink-0" />

								<div className="space-y-2 w-full flex-1 min-h-0 overflow-hidden flex flex-col">
									<div className="flex items-center justify-between flex-shrink-0">
										<div className="text-sm font-semibold">
											Animations ({availableAnimations.length})
										</div>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => setIsPaused(!isPaused)}
											className="h-6 w-6 p-0"
											title={isPaused ? "Play animation" : "Pause animation"}
											disabled={isLoading}
										>
											{isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
										</Button>
									</div>
									<div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar px-1 flex-1 min-h-0">
										{[...availableAnimations]
											.sort((a, b) =>
												formatAnimationName(a).localeCompare(formatAnimationName(b))
											)
											.map((animName) => (
												<Button
													key={animName}
													size="sm"
													variant={selectedAnimation === animName ? "default" : "outline"}
													onClick={() => setSelectedAnimation(animName)}
													title={animName}
													disabled={isLoading}
												>
													<span className="text-start text-xs truncate w-full">
														{formatAnimationName(animName)}
													</span>
												</Button>
											))}
									</div>
								</div>
							</>
						)}
					</div>

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
						>
							{isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
						</Button>
					</CollapsibleTrigger>

					<Canvas ref={canvasRef} shadows gl={{ toneMapping: THREE.NoToneMapping }}>
						<PerspectiveCamera ref={cameraRef} makeDefault position={INITIAL_CAMERA_POSITION} />
						<OrbitControls
							ref={controlsRef}
							enablePan={true}
							enableZoom={true}
							enableRotate={true}
							maxDistance={10}
							minDistance={0.005}
							target={INITIAL_CAMERA_TARGET}
						/>

						{/* Lighting setup */}
						<ambientLight intensity={1} />
						<directionalLight
							position={[0, 10, 0]}
							intensity={0.7}
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
								selectedAnimation={selectedAnimation}
								isPaused={isPaused}
								setIsLoading={setIsLoading}
								setLoadingProgress={setLoadingProgress}
							/>
							{selectedScene === "grid" ? (
								<gridHelper args={[10, 10]} />
							) : (
								<Scene sceneName={selectedScene} />
							)}
						</Suspense>
					</Canvas>

					{/* Camera Controls */}
					<div className="absolute top-4 right-4 flex flex-col gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button size="sm" variant="secondary" disabled={isLoading}>
									<Info className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent className="space-y-1">
								<div>
									<Kbd>Left Click</Kbd> Rotate
								</div>
								<div>
									<Kbd>Right Click</Kbd> Move
								</div>
								<div>
									<Kbd>Scroll</Kbd> Zoom
								</div>
							</TooltipContent>
						</Tooltip>
						<Button size="sm" variant="secondary" onClick={resetCamera} disabled={isLoading}>
							<RotateCcw className="h-4 w-4" />
						</Button>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button size="sm" variant="secondary" onClick={captureScreenshot} disabled={isLoading}>
									<Camera className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<div>Take Screenshot</div>
							</TooltipContent>
						</Tooltip>
					</div>

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
					<Dialog open={screenshotDialog} onOpenChange={setScreenshotDialog}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Screenshot Captured</DialogTitle>
								<DialogDescription>Choose how you want to save your screenshot.</DialogDescription>
							</DialogHeader>
							{screenshotUrl && (
								<div className="flex justify-center">
									<img
										src={screenshotUrl}
										alt="Screenshot preview"
										className="max-w-full h-auto rounded-lg border"
									/>
								</div>
							)}
							<DialogFooter className="flex gap-2">
								<Button variant="outline" onClick={copyToClipboard}>
									<Copy className="h-4 w-4 mr-2" />
									Copy to Clipboard
								</Button>
								<Button onClick={downloadScreenshot}>
									<Download className="h-4 w-4 mr-2" />
									Download
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</Collapsible>
	)
}

export default function Models({ heroData, heroModels }: ModelsProps) {
	const [selectedCostume, setSelectedCostume] = useState<string>("")
	const [loading, setLoading] = useState(true)
	const [availableAnimations, setAvailableAnimations] = useState<string[]>([])
	const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)
	const [isLoadingModels, setIsLoadingModels] = useState(false)
	const animationsCacheRef = useRef<Map<string, string[]>>(new Map()) // Cache animations per costume

	// Helper function to format costume name
	const formatCostumeName = (costumeName: string) => {
		return costumeName
			.replace(/^Cos\d+/, "") // Remove Cos prefix
			.replace(/([A-Z])/g, " $1") // Add spaces before capitals
			.trim()
	}

	// Helper function to get sorted costumes (same logic as in the UI)
	const getSortedCostumes = (costumes: string[]) => {
		return [...costumes].sort((a, b) => {
			const aIsVari = a.startsWith("Vari")
			const bIsVari = b.startsWith("Vari")

			// If one is Vari and the other isn't, put Vari at the bottom
			if (aIsVari && !bIsVari) return 1
			if (!aIsVari && bIsVari) return -1

			// Otherwise, sort alphabetically by formatted name
			return formatCostumeName(a).localeCompare(formatCostumeName(b))
		})
	}

	useEffect(() => {
		// Set default costume to the first one after sorting
		const costumes = Object.keys(heroModels)
		if (costumes.length > 0) {
			const sortedCostumes = getSortedCostumes(costumes)
			setSelectedCostume(sortedCostumes[0])
		}
		setLoading(false)
	}, [heroModels])

	// Load animations for the selected costume
	useEffect(() => {
		if (!selectedCostume) return

		// Check if we already have animations cached for this costume
		if (animationsCacheRef.current.has(selectedCostume)) {
			const cachedAnimations = animationsCacheRef.current.get(selectedCostume)!
			setAvailableAnimations(cachedAnimations)
			setSelectedAnimation(cachedAnimations[0] || null)
			return
		}

		// Clear animations when switching to uncached costume
		setAvailableAnimations([])
		setSelectedAnimation(null)

		const loadAnimations = async () => {
			const fbxLoader = new FBXLoader()
			const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
			const modelDir = `${basePath}/kingsraid-models/models/heroes`

			// Load from the current costume's models - prioritize body, then first available
			const costumeModels = heroModels[selectedCostume]
			if (!costumeModels || costumeModels.length === 0) {
				return
			}

			// Try to find body model first, as it typically has the most complete animation set
			const bodyModel = costumeModels.find((m) => m.type === "body")
			const firstModel = bodyModel || costumeModels[0]

			try {
				const fbx = await new Promise<THREE.Group>((resolve, reject) => {
					const timeout = setTimeout(() => {
						reject(new Error(`Timeout loading ${firstModel.path}`))
					}, 30000) // 30 second timeout

					fbxLoader.load(
						`${modelDir}/${firstModel.path}`,
						(loadedFbx) => {
							clearTimeout(timeout)
							resolve(loadedFbx)
						},
						undefined,
						(error) => {
							clearTimeout(timeout)
							reject(error)
						}
					)
				})

				if (fbx.animations && fbx.animations.length > 0) {
					const animNames = fbx.animations
						.map((clip) => clip.name)
						.filter((name) => !name.includes("_Weapon@") && !name.includes("Extra"))

					if (animNames.length > 0) {
						// Sort animations before caching and selecting
						const sortedAnimNames = [...animNames].sort((a, b) => {
							const formatName = (animName: string): string => {
								let formatted = animName.split("@")[1] || animName
								const parts = formatted.split("_")
								if (parts.length > 1 && parts[1].startsWith(parts[0])) {
									formatted = [parts[1], ...parts.slice(2)].join("_")
								}
								return formatted.charAt(0).toUpperCase() + formatted.slice(1)
							}
							return formatName(a).localeCompare(formatName(b))
						})

						// Use a microtask to ensure state updates are batched properly
						Promise.resolve().then(() => {
							// Cache the sorted animations for this costume
							animationsCacheRef.current.set(selectedCostume, sortedAnimNames)
							setAvailableAnimations(sortedAnimNames)
							setSelectedAnimation(sortedAnimNames[0])
						})
					} else {
						// Cache empty array for costumes with no animations
						animationsCacheRef.current.set(selectedCostume, [])
					}
				} else {
					// Cache empty array for costumes with no animations
					animationsCacheRef.current.set(selectedCostume, [])
				}
			} catch (error) {
				console.error(`Failed to load animations for costume ${selectedCostume}:`, error)
				// Cache empty array on error to avoid repeated failed loads
				animationsCacheRef.current.set(selectedCostume, [])
			}
		}

		loadAnimations()
	}, [selectedCostume, heroModels])

	if (loading) {
		return (
			<Card>
				<CardContent>
					<Skeleton className="w-full h-96 rounded-lg" />
				</CardContent>
			</Card>
		)
	}

	const costumeOptions = Object.keys(heroModels).sort()
	const currentModels = selectedCostume ? heroModels[selectedCostume] || [] : []

	if (costumeOptions.length === 0) {
		return (
			<Card>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">
						No 3D models available for {heroData.infos.name}
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="flex flex-col lg:flex-row gap-6">
			{/* Left sidebar for costume selection */}
			<div className="w-full lg:w-60 flex-shrink-0 space-y-4">
				{costumeOptions.length > 1 && (
					<Card>
						<CardHeader>
							<CardTitle>Models ({costumeOptions.length} variants)</CardTitle>
						</CardHeader>
						<CardContent className="h-fit lg:h-200 overflow-y-auto custom-scrollbar">
							<div className="grid grid-cols-1 gap-2">
								{[...costumeOptions]
									.sort((a, b) => {
										const aIsVari = a.startsWith("Vari")
										const bIsVari = b.startsWith("Vari")

										// If one is Vari and the other isn't, put Vari at the bottom
										if (aIsVari && !bIsVari) return 1
										if (!aIsVari && bIsVari) return -1

										// Otherwise, sort alphabetically by formatted name
										return formatCostumeName(a).localeCompare(formatCostumeName(b))
									})
									.map((costume) => (
										<div
											key={costume}
											className={`p-2 rounded-lg border transition-colors ${
												costume === selectedCostume
													? "border-primary bg-primary/5"
													: "border-muted hover:border-primary/50"
											} ${isLoadingModels ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
											onClick={() => !isLoadingModels && setSelectedCostume(costume)}
										>
											<div className="font-medium">{formatCostumeName(costume)}</div>
											<div className="text-xs text-muted-foreground mt-1">
												{heroModels[costume]
													.map((m) => m.type)
													.sort((a, b) => a.localeCompare(b))
													.join(", ")}
											</div>
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Main content */}
			<div className="flex-1 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>{selectedCostume && selectedCostume}</CardTitle>
					</CardHeader>
					<CardContent>
						{currentModels.length > 0 ? (
							<ModelViewer
								key="model-viewer-stable" // Stable key to prevent unmounting
								modelFiles={currentModels}
								availableAnimations={availableAnimations}
								selectedAnimation={selectedAnimation}
								setSelectedAnimation={setSelectedAnimation}
								isLoading={isLoadingModels}
								setIsLoading={setIsLoadingModels}
							/>
						) : (
							<div className="text-center text-muted-foreground py-8">
								No models available for this costume
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
