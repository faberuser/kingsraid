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
import { Spinner } from "@/components/ui/spinner"
import { RotateCcw, Info, Eye, EyeOff, Play, Pause } from "lucide-react"
import { ModelFile } from "@/model/Hero_Model"
import { Separator } from "@/components/ui/separator"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

// Suppress THREE.js PropertyBinding warnings for missing bones (common in FBX files)
const originalWarn = console.warn
console.warn = function (...args) {
	const message = args[0]
	if (typeof message === "string" && message.includes("THREE.PropertyBinding: No target node found")) {
		return
	}
	originalWarn.apply(console, args)
}

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
	availableAnimations,
	setAvailableAnimations,
	setSelectedAnimation,
	isPaused,
	setIsLoading,
}: {
	modelFiles: ModelFile[]
	visibleModels: Set<string>
	selectedAnimation: string | null
	availableAnimations?: string[]
	setAvailableAnimations?: (a: string[]) => void
	setSelectedAnimation?: (s: string | null) => void
	isPaused?: boolean
	setIsLoading?: (loading: boolean) => void
}) {
	const groupRef = useRef<THREE.Group>(null)
	const [loadedModels, setLoadedModels] = useState<Map<string, HeroModel>>(new Map())
	const mixersRef = useRef<Map<string, THREE.AnimationMixer>>(new Map())
	const activeActionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map())
	const sharedAnimationsRef = useRef<THREE.AnimationClip[]>([])
	const [loading, setLoading] = useState<Set<string>>(new Set())

	useEffect(() => {
		const loadModel = async (modelFile: ModelFile) => {
			if (loadedModels.has(modelFile.name)) return
			const modelDir = `${basePath}/kingsraid-models/models/heroes`

			setLoading((prev) => new Set(prev).add(modelFile.name))

			try {
				const fbxLoader = new FBXLoader()

				// Load FBX model
				const fbx = await new Promise<THREE.Group>((resolve, reject) => {
					fbxLoader.load(`${modelDir}/${modelFile.path}`, resolve, undefined, reject)
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

								// For skinned meshes, use MeshStandardMaterial which supports skinning
								// For non-skinned meshes, use MeshBasicMaterial
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
						mesh.castShadow = false
						mesh.receiveShadow = false
					}
				})

				// Position models based on type
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

					// If parent hasn't populated available animations yet, derive and set them
					if (setAvailableAnimations && (!availableAnimations || availableAnimations.length === 0)) {
						const animNames = modelWithAnimations.animations
							.map((clip) => clip.name)
							.filter((name) => !name.includes("_Weapon@") && !name.includes("Extra"))
						if (animNames.length > 0) {
							setAvailableAnimations(animNames)
							if (setSelectedAnimation) setSelectedAnimation(animNames[0])
						}
					}
				}

				// Always create a mixer for every model
				const mixer = new THREE.AnimationMixer(modelWithAnimations)
				modelWithAnimations.mixer = mixer
				mixersRef.current.set(modelFile.name, mixer)

				setLoadedModels((prev) => new Map(prev).set(modelFile.name, modelWithAnimations))
			} catch (error) {
				console.error(`Failed to load model ${modelFile.name}:`, error)
			} finally {
				setLoading((prev) => {
					const newSet = new Set(prev)
					newSet.delete(modelFile.name)
					return newSet
				})
			}
		}

		// Load models sequentially: body first to ensure animations are available
		const loadModelsSequentially = async () => {
			if (setIsLoading) setIsLoading(true)

			const sortedModels = [...modelFiles].sort((a, b) => {
				if (a.type === "body") return -1
				if (b.type === "body") return 1
				return 0
			})

			for (const modelFile of sortedModels) {
				if (visibleModels.has(modelFile.name)) {
					await loadModel(modelFile)
				}
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

function ModelViewer({
	modelFiles,
	availableAnimations,
	selectedAnimation,
	setSelectedAnimation,
	setAvailableAnimations,
}: {
	modelFiles: ModelFile[]
	availableAnimations: string[]
	selectedAnimation: string | null
	setSelectedAnimation: (s: string | null) => void
	setAvailableAnimations: (a: string[]) => void
}) {
	const INITIAL_CAMERA_POSITION: [number, number, number] = [0, 1, 3]
	const INITIAL_CAMERA_TARGET: [number, number, number] = [0, 1, 0]

	const [visibleModels, setVisibleModels] = useState<Set<string>>(new Set())
	const [isPaused, setIsPaused] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	const controlsRef = useRef<any>(null)
	const cameraRef = useRef<THREE.PerspectiveCamera>(null)

	useEffect(() => {
		// Auto-load all available components for the selected costume
		if (modelFiles.length > 0) {
			setIsLoading(true) // Start loading when models change
			const modelNames = modelFiles.map((m) => m.name)
			setVisibleModels(new Set(modelNames))
		}
	}, [modelFiles])

	// Format animation name for display
	const formatAnimationName = (animName: string): string => {
		// Remove hero name prefix (e.g., "Hero_Aisha@Run_Run" -> "Run_Run")
		let formatted = animName.split("@")[1] || animName

		// Remove duplicate parts (e.g., "Run_Run" -> "Run")
		const parts = formatted.split("_")
		if (parts.length === 2 && parts[0] === parts[1]) {
			formatted = parts[0]
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

	return (
		<div className="space-y-4 flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-200 lg:max-h-200">
			<div className="flex flex-col gap-4 lg:w-48 flex-shrink-0 overflow-hidden lg:h-full">
				{/* Individual Model Toggles */}
				<div className="flex flex-row flex-wrap lg:flex-col items-center gap-2 flex-shrink-0">
					{Array.from(new Map(modelFiles.map((model) => [model.name, model])).values()).map((model) => (
						<Button
							key={model.name}
							size="sm"
							variant={visibleModels.has(model.name) ? "default" : "outline"}
							onClick={() => toggleModelVisibility(model.name)}
							className="flex items-center gap-2 w-full"
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
								<div className="text-sm font-semibold">Animations ({availableAnimations.length})</div>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => setIsPaused(!isPaused)}
									className="h-6 w-6 p-0"
									title={isPaused ? "Play animation" : "Pause animation"}
								>
									{isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
								</Button>
							</div>
							<div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar px-1 flex-1 min-h-0">
								{availableAnimations.map((animName) => (
									<Button
										key={animName}
										size="sm"
										variant={selectedAnimation === animName ? "default" : "outline"}
										onClick={() => setSelectedAnimation(animName)}
										className="justify-start text-xs truncate overflow-hidden whitespace-nowrap flex-shrink-0"
										title={animName}
									>
										{formatAnimationName(animName)}
									</Button>
								))}
							</div>
						</div>
					</>
				)}
			</div>

			{/* 3D Viewer */}
			<div className="relative w-full h-200 lg:h-auto bg-gradient-to-b from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
				<Canvas gl={{ toneMapping: THREE.NoToneMapping }}>
					<PerspectiveCamera ref={cameraRef} makeDefault position={INITIAL_CAMERA_POSITION} />
					<OrbitControls
						ref={controlsRef}
						enablePan={true}
						enableZoom={true}
						enableRotate={true}
						maxDistance={10}
						minDistance={0.5}
						target={INITIAL_CAMERA_TARGET}
					/>
					<Suspense fallback={null}>
						<Model
							modelFiles={modelFiles}
							visibleModels={visibleModels}
							selectedAnimation={selectedAnimation}
							availableAnimations={availableAnimations}
							setAvailableAnimations={setAvailableAnimations}
							setSelectedAnimation={setSelectedAnimation}
							isPaused={isPaused}
							setIsLoading={setIsLoading}
						/>
					</Suspense>
					<gridHelper args={[10, 10]} />
				</Canvas>

				{/* Camera Controls */}
				<div className="absolute top-4 right-4 flex flex-col gap-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button size="sm" variant="secondary">
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
					<Button size="sm" variant="secondary" onClick={resetCamera}>
						<RotateCcw className="h-4 w-4" />
					</Button>
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
						<div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg flex items-center gap-3">
							<Spinner className="h-5 w-5" />
							<span className="text-sm font-medium">Loading models...</span>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default function Models({ heroData, heroModels }: ModelsProps) {
	const [selectedCostume, setSelectedCostume] = useState<string>("")
	const [loading, setLoading] = useState(true)
	const [availableAnimations, setAvailableAnimations] = useState<string[]>([])
	const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)
	const animationsCacheRef = useRef<Map<string, string[]>>(new Map()) // Cache animations per costume

	useEffect(() => {
		// Set default costume (prioritize non-default costumes)
		const costumes = Object.keys(heroModels).sort()
		if (costumes.length > 0) {
			// Prefer costumes with "Cos" in the name, fallback to first available
			const preferredCostume = costumes.find((c) => c.includes("Cos")) || costumes[0]
			setSelectedCostume(preferredCostume)
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

			// Load from the current costume's first model
			const firstModels = heroModels[selectedCostume]
			const firstModel = firstModels && firstModels.length > 0 ? firstModels[0] : null
			if (!firstModel) return

			try {
				const fbx = await new Promise<THREE.Group>((resolve, reject) => {
					fbxLoader.load(`${modelDir}/${firstModel.path}`, resolve, undefined, reject)
				})

				if (fbx.animations && fbx.animations.length > 0) {
					const animNames = fbx.animations
						.map((clip) => clip.name)
						.filter((name) => !name.includes("_Weapon@") && !name.includes("Extra"))

					if (animNames.length > 0) {
						// Cache the animations for this costume
						animationsCacheRef.current.set(selectedCostume, animNames)
						setAvailableAnimations(animNames)
						setSelectedAnimation(animNames[0])
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

	// Helper function to format costume name
	const formatCostumeName = (costumeName: string) => {
		return costumeName
			.replace(/^Cos\d+/, "") // Remove Cos prefix
			.replace(/([A-Z])/g, " $1") // Add spaces before capitals
			.trim()
	}

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
			<div className="w-full lg:w-70 flex-shrink-0 space-y-4">
				{costumeOptions.length > 1 && (
					<Card>
						<CardHeader>
							<CardTitle>Models ({costumeOptions.length} variants)</CardTitle>
						</CardHeader>
						<CardContent className="h-fit lg:h-200 overflow-y-auto custom-scrollbar">
							<div className="grid grid-cols-1 gap-2">
								{costumeOptions.map((costume) => (
									<div
										key={costume}
										className={`p-2 rounded-lg border cursor-pointer transition-colors ${
											costume === selectedCostume
												? "border-primary bg-primary/5"
												: "border-muted hover:border-primary/50"
										}`}
										onClick={() => setSelectedCostume(costume)}
									>
										<div className="font-medium">{formatCostumeName(costume)}</div>
										<div className="text-xs text-muted-foreground mt-1">
											{heroModels[costume].map((m) => m.type).join(", ")}
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
								setAvailableAnimations={setAvailableAnimations}
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
