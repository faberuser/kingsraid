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

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

interface ModelsProps {
	heroData: HeroData
	heroModels: { [costume: string]: ModelFile[] }
}

type HeroModel = THREE.Group & {
	mixer?: THREE.AnimationMixer
	animations?: THREE.AnimationClip[]
}

function Model({ modelFiles, visibleModels }: { modelFiles: ModelFile[]; visibleModels: Set<string> }) {
	const groupRef = useRef<THREE.Group>(null)
	const [loadedModels, setLoadedModels] = useState<Map<string, HeroModel>>(new Map())
	const [mixers, setMixers] = useState<THREE.AnimationMixer[]>([])
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

								// Create a new MeshToonMaterial
								if (opacity === 0) {
									// Use MeshBasicMaterial with transparency for invisible materials
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
									const basicMaterial = new THREE.MeshBasicMaterial({
										name: name,
										map: originalMap,
										...(originalMap ? {} : { color: color }),
										...(opacity < 1 ? { transparent: true, opacity: opacity } : {}),
									})

									if (Array.isArray(mesh.material)) {
										mesh.material[index] = basicMaterial
									} else {
										mesh.material = basicMaterial
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

				// Set up animations
				const newMixers = [...mixers]
				if (fbx.animations && fbx.animations.length > 0) {
					const mixer = new THREE.AnimationMixer(fbx)
					const action = mixer.clipAction(fbx.animations[0])
					action.play()
					newMixers.push(mixer)
					;(fbx as HeroModel).mixer = mixer
					;(fbx as HeroModel).animations = fbx.animations
				}

				const rotation = -Math.PI / 2 // Rotate -90 degrees to make it stand upright

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
					modelFile.type === "hair"
					// modelFile.type === "mask"
				) {
					fbx.position.set(0, 0, 0)
					fbx.rotation.x = rotation
				} else if (weaponTypes.includes(modelFile.type)) {
					if (!modelFile.defaultPosition) {
						fbx.position.set(1, 0, 0)
					}
					fbx.rotation.x = rotation
				} else {
					// Default positioning for unknown types
					fbx.position.set(0, 0, 0)
					fbx.rotation.x = rotation
				}

				setLoadedModels((prev) => new Map(prev).set(modelFile.name, fbx as HeroModel))
				setMixers(newMixers)
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

		// Load only visible models
		modelFiles.forEach((modelFile) => {
			if (visibleModels.has(modelFile.name)) {
				loadModel(modelFile)
			}
		})

		return () => {
			mixers.forEach((mixer) => mixer.stopAllAction())
		}
	}, [modelFiles, visibleModels])

	useFrame((state, delta) => {
		mixers.forEach((mixer) => mixer.update(delta))
	})

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
	const controlsRef = useRef<any>(null)
	const cameraRef = useRef<THREE.PerspectiveCamera>(null)

	useEffect(() => {
		// Auto-load all available components for the selected costume
		if (modelFiles.length > 0) {
			const modelNames = modelFiles.map((m) => m.name)
			setVisibleModels(new Set(modelNames))
		}
	}, [modelFiles])

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
		<div className="space-y-4 flex flex-col lg:flex-row gap-4 lg:gap-6">
			{/* Individual Model Toggles */}
			<div className="flex flex-row flex-wrap lg:flex-col gap-2">
				{Array.from(new Map(modelFiles.map((model) => [model.name, model])).values()).map((model) => (
					<Button
						key={model.name}
						size="sm"
						variant={visibleModels.has(model.name) ? "default" : "outline"}
						onClick={() => toggleModelVisibility(model.name)}
						className="flex items-center gap-2 w-30"
					>
						{visibleModels.has(model.name) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
						<span className="capitalize">{model.type}</span>
					</Button>
				))}
			</div>

			{/* 3D Viewer */}
			<div className="relative h-200 w-full bg-gradient-to-b from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
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
						<Model modelFiles={modelFiles} visibleModels={visibleModels} />
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
					<div className="absolute bottom-4 left-4">
						<div className="bg-black/50 text-white px-2 py-1 rounded text-sm">
							Models: {Array.from(visibleModels).length}/{modelFiles.length}
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
