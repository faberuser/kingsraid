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
import { RotateCcw, Info, Eye, EyeOff } from "lucide-react"
import { ModelFile } from "@/model/Hero_Model"
import { Separator } from "@/components/ui/separator"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

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
}: {
	modelFiles: ModelFile[]
	visibleModels: Set<string>
	selectedAnimation: string | null
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
					"weapon01",
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
		mixersRef.current.forEach((mixer) => mixer.update(delta))
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

function ModelViewer({ modelFiles }: { modelFiles: ModelFile[] }) {
	const INITIAL_CAMERA_POSITION: [number, number, number] = [0, 1, 3]
	const INITIAL_CAMERA_TARGET: [number, number, number] = [0, 1, 0]

	const [visibleModels, setVisibleModels] = useState<Set<string>>(new Set())
	const [availableAnimations, setAvailableAnimations] = useState<string[]>([])
	const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)
	const controlsRef = useRef<any>(null)
	const cameraRef = useRef<THREE.PerspectiveCamera>(null)

	useEffect(() => {
		// Auto-load all available components for the selected costume
		if (modelFiles.length > 0) {
			const modelNames = modelFiles.map((m) => m.name)
			setVisibleModels(new Set(modelNames))
		}
	}, [modelFiles])

	// Detect animations from loaded models
	useEffect(() => {
		const loadAnimations = async () => {
			const fbxLoader = new FBXLoader()
			const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
			const modelDir = `${basePath}/kingsraid-models/models/heroes`

			// Load the first model file to get animations
			const firstModel = modelFiles[0]
			if (!firstModel) return

			try {
				const fbx = await new Promise<THREE.Group>((resolve, reject) => {
					fbxLoader.load(`${modelDir}/${firstModel.path}`, resolve, undefined, reject)
				})

				if (fbx.animations && fbx.animations.length > 0) {
					// Filter out weapon and extra animations, and format names
					const animNames = fbx.animations
						.map((clip) => clip.name)
						.filter((name) => {
							// Exclude weapon and extra animations
							return !name.includes("_Weapon@") && !name.includes("Extra")
						})
					setAvailableAnimations(animNames)
					// Auto-select first animation
					if (animNames.length > 0) {
						setSelectedAnimation(animNames[0])
					}
				}
			} catch (error) {
				console.error("Failed to load animations:", error)
			}
		}

		loadAnimations()
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
		<div className="space-y-4 flex flex-col lg:flex-row gap-4 lg:gap-6 h-200 max-h-200">
			<div className="flex flex-col flex-wrap gap-6 h-full">
				{/* Individual Model Toggles */}
				<div className="flex flex-row flex-wrap lg:flex-col items-center gap-2">
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

				<Separator />

				{/* Animation Selection */}
				{availableAnimations.length > 0 && (
					<div className="space-y-2 w-full">
						<div className="text-sm font-semibold">Animations ({availableAnimations.length})</div>
						<div className="flex flex-col gap-1 max-h-150 overflow-y-auto custom-scrollbar px-1">
							{availableAnimations.map((animName) => (
								<Button
									key={animName}
									size="sm"
									variant={selectedAnimation === animName ? "default" : "outline"}
									onClick={() => setSelectedAnimation(animName)}
									className="justify-start text-xs truncate overflow-hidden whitespace-nowrap"
									title={animName}
								>
									{formatAnimationName(animName)}
								</Button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* 3D Viewer */}
			<div className="relative w-full bg-gradient-to-b from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
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
			</div>
		</div>
	)
}

export default function Models({ heroData, heroModels }: ModelsProps) {
	const [selectedCostume, setSelectedCostume] = useState<string>("")
	const [loading, setLoading] = useState(true)

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
							<ModelViewer modelFiles={currentModels} />
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
