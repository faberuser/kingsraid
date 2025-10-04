"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { FBXLoader } from "three-stdlib"
import { TextureLoader } from "three"
import * as THREE from "three"
import { HeroData } from "@/model/Hero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RotateCcw, ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react"
import { ModelWithTextures } from "@/model/Hero_Model"

interface ModelsProps {
	heroData: HeroData
	heroModels: { [costume: string]: ModelWithTextures[] }
}

type HeroModel = THREE.Group & {
	mixer?: THREE.AnimationMixer
	animations?: THREE.AnimationClip[]
}

function Model({ modelFiles, visibleModels }: { modelFiles: ModelWithTextures[]; visibleModels: Set<string> }) {
	const groupRef = useRef<THREE.Group>(null)
	const [loadedModels, setLoadedModels] = useState<Map<string, HeroModel>>(new Map())
	const [mixers, setMixers] = useState<THREE.AnimationMixer[]>([])
	const [loading, setLoading] = useState<Set<string>>(new Set())

	useEffect(() => {
		const loadModel = async (modelFile: ModelWithTextures) => {
			if (loadedModels.has(modelFile.name)) return
			const modelDir = `/kingsraid-models/models/heroes`

			setLoading((prev) => new Set(prev).add(modelFile.name))

			try {
				const fbxLoader = new FBXLoader()
				const textureLoader = new TextureLoader()

				// Load FBX model
				const fbx = await new Promise<THREE.Group>((resolve, reject) => {
					fbxLoader.load(`${modelDir}/${modelFile.path}`, resolve, undefined, reject)
				})

				// Load textures using the manifest data
				let mainTexture = null
				let eyeTexture = null
				let wingTexture = null
				let ornamentTexture = null

				// Load diffuse texture
				if (
					"diffuse" in modelFile.textures &&
					typeof modelFile.textures.diffuse === "string" &&
					modelFile.textures.diffuse
				) {
					try {
						mainTexture = await new Promise<THREE.Texture>((resolve, reject) => {
							textureLoader.load(
								`${modelDir}/${(modelFile.textures as { diffuse: string }).diffuse}`,
								resolve,
								undefined,
								reject
							)
						})
						mainTexture.flipY = true
					} catch (error) {
						console.warn(
							`Failed to load diffuse texture: ${(modelFile.textures as { diffuse: string }).diffuse}`
						)
					}
				}

				// Load eye texture
				if (
					"eye" in modelFile.textures &&
					typeof (modelFile.textures as { eye?: string }).eye === "string" &&
					(modelFile.textures as { eye?: string }).eye
				) {
					try {
						eyeTexture = await new Promise<THREE.Texture>((resolve, reject) => {
							textureLoader.load(
								`${modelDir}/${(modelFile.textures as { eye: string }).eye}`,
								resolve,
								undefined,
								reject
							)
						})
						eyeTexture.flipY = true
					} catch (error) {
						console.warn(`Failed to load eye texture: ${(modelFile.textures as { eye: string }).eye}`)
					}
				}

				// Load wing texture
				if (
					"wing" in modelFile.textures &&
					typeof (modelFile.textures as { wing?: string }).wing === "string" &&
					(modelFile.textures as { wing?: string }).wing
				) {
					try {
						wingTexture = await new Promise<THREE.Texture>((resolve, reject) => {
							textureLoader.load(
								`${modelDir}/${(modelFile.textures as { wing: string }).wing}`,
								resolve,
								undefined,
								reject
							)
						})
						wingTexture.flipY = true
					} catch (error) {
						console.warn(`Failed to load wing texture: ${(modelFile.textures as { wing: string }).wing}`)
					}
				}

				// Load hair texture
				if (
					"hair" in modelFile.textures &&
					typeof (modelFile.textures as { hair?: string }).hair === "string" &&
					(modelFile.textures as { hair?: string }).hair
				) {
					try {
						mainTexture = await new Promise<THREE.Texture>((resolve, reject) => {
							textureLoader.load(
								`${modelDir}/${(modelFile.textures as { hair: string }).hair}`,
								resolve,
								undefined,
								reject
							)
						})
						mainTexture.flipY = true
					} catch (error) {
						console.warn(`Failed to load hair texture: ${(modelFile.textures as { hair: string }).hair}`)
					}
				}

				// Load ornament texture
				if (
					"ornament" in modelFile.textures &&
					typeof (modelFile.textures as { ornament?: string }).ornament === "string" &&
					(modelFile.textures as { ornament?: string }).ornament
				) {
					try {
						ornamentTexture = await new Promise<THREE.Texture>((resolve, reject) => {
							textureLoader.load(
								`${modelDir}/${(modelFile.textures as { ornament: string }).ornament}`,
								resolve,
								undefined,
								reject
							)
						})
						ornamentTexture.flipY = true
					} catch (error) {
						console.warn(
							`Failed to load ornament texture: ${(modelFile.textures as { ornament: string }).ornament}`
						)
					}
				}

				// Apply textures to model
				if (mainTexture || eyeTexture) {
					fbx.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							if (child.name.toLowerCase().includes("hair") && mainTexture) {
								// Hair material - anime style (Blender equivalent)
								if (Array.isArray(child.material)) {
									child.material = child.material.map((mat) => {
										const matName = mat.name?.toLowerCase() || ""
										// If this is the ornament material (e.g., contains "ac"), use ornament texture if available
										if (matName.includes("ac") && ornamentTexture) {
											return new THREE.MeshToonMaterial({
												map: ornamentTexture,
												name: mat.name,
											})
										}
										// Otherwise, use the main hair texture
										return new THREE.MeshToonMaterial({
											map: mainTexture,
											name: mat.name,
										})
									})
								} else {
									// Single material, just use main hair texture
									child.material = new THREE.MeshToonMaterial({
										map: mainTexture,
										name: child.material.name,
									})
								}
							} else if (child.name.toLowerCase().includes("wing") && wingTexture) {
								// Wing material
								if (Array.isArray(child.material)) {
									child.material = child.material.map(
										(mat) =>
											new THREE.MeshStandardMaterial({
												map: wingTexture,
												name: mat.name,
											})
									)
								} else {
									child.material = new THREE.MeshStandardMaterial({
										map: wingTexture,
										name: child.material.name,
									})
								}
							} else if (child.name.toLowerCase().includes("facial_a") && eyeTexture) {
								let materials = []

								if (Array.isArray(child.material)) {
									// Replace each material based on its name
									materials = child.material.map((originalMat) => {
										const matName = originalMat.name?.toLowerCase() || ""

										if (matName.includes("eye") && eyeTexture) {
											// Eye material
											return new THREE.MeshStandardMaterial({
												map: eyeTexture,
												name: originalMat.name,
											})
										} else if (mainTexture) {
											// Skin material
											return new THREE.MeshToonMaterial({
												map: mainTexture,
												name: originalMat.name,
											})
										}
										return originalMat
									})
								} else {
									// Single material, check if it's eye or skin
									const matName = child.material.name?.toLowerCase() || ""
									const useEyeTexture = matName.includes("eye") && eyeTexture

									materials = [
										new THREE.MeshToonMaterial({
											map: useEyeTexture ? eyeTexture : mainTexture,
										}),
									]
								}

								child.material = materials
							} else if (mainTexture) {
								child.material = new THREE.MeshToonMaterial({
									map: mainTexture,
								})
							}

							child.castShadow = false
							child.receiveShadow = false
						}
					})
				} else {
					console.warn(`No textures found for ${modelFile.name}, using default material`)
					// Apply default material if no textures found
					fbx.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							child.material = new THREE.MeshToonMaterial({
								color: 0xcccccc,
							})
							child.castShadow = false
							child.receiveShadow = false
						}
					})
				}

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
				]

				if (modelFile.type === "body" || modelFile.type === "arms" || modelFile.type === "hair") {
					fbx.position.set(0, 0, 0)
					fbx.rotation.x = rotation
				} else if (weaponTypes.includes(modelFile.type)) {
					fbx.position.set(0.5, 0, 0)
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

function ModelViewer({ modelFiles }: { modelFiles: ModelWithTextures[] }) {
	const INITIAL_CAMERA_POSITION: [number, number, number] = [0, 1, 3]
	const INITIAL_CAMERA_TARGET: [number, number, number] = [0, 1, 0]

	const [cameraPosition, setCameraPosition] = useState<[number, number, number]>(INITIAL_CAMERA_POSITION)
	const [visibleModels, setVisibleModels] = useState<Set<string>>(new Set())
	const controlsRef = useRef<any>(null)

	useEffect(() => {
		// Auto-load all available components for the selected costume
		if (modelFiles.length > 0) {
			const modelNames = modelFiles.map((m) => m.name)
			setVisibleModels(new Set(modelNames))
		}
	}, [modelFiles])

	const resetCamera = () => {
		setCameraPosition(INITIAL_CAMERA_POSITION)
		if (controlsRef.current) {
			controlsRef.current.target.set(...INITIAL_CAMERA_TARGET)
			controlsRef.current.update()
		}
	}

	const zoomIn = () => {
		setCameraPosition((prev) => [prev[0], prev[1], Math.max(prev[2] - 0.5, 0.5)])
	}

	const zoomOut = () => {
		setCameraPosition((prev) => [prev[0], prev[1], Math.min(prev[2] + 0.5, 10)])
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
		<div className="space-y-4 flex flex-col md:flex-row gap-4 md:gap-6">
			{/* Individual Model Toggles */}
			<div className="flex flex-row flex-wrap md:flex-col gap-2">
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
				<Canvas shadows>
					<PerspectiveCamera makeDefault position={cameraPosition} />
					<OrbitControls
						ref={controlsRef}
						enablePan={true}
						enableZoom={true}
						enableRotate={true}
						maxDistance={10}
						minDistance={0.5}
						target={[0, 1, 0]}
					/>
					<ambientLight intensity={1.25} />
					<Suspense fallback={null}>
						<Model modelFiles={modelFiles} visibleModels={visibleModels} />
					</Suspense>
					<gridHelper args={[10, 10]} />
				</Canvas>

				{/* Camera Controls */}
				<div className="absolute top-4 right-4 flex flex-col gap-2">
					<Button size="sm" variant="secondary" onClick={resetCamera}>
						<RotateCcw className="h-4 w-4" />
					</Button>
					<Button size="sm" variant="secondary" onClick={zoomIn}>
						<ZoomIn className="h-4 w-4" />
					</Button>
					<Button size="sm" variant="secondary" onClick={zoomOut}>
						<ZoomOut className="h-4 w-4" />
					</Button>
				</div>

				{/* Loading indicator */}
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
		<div className="flex flex-col md:flex-row gap-6">
			{/* Left sidebar for costume selection */}
			<div className="w-full md:w-70 flex-shrink-0 space-y-4">
				{costumeOptions.length > 1 && (
					<Card>
						<CardHeader>
							<CardTitle>Models ({costumeOptions.length} variants)</CardTitle>
						</CardHeader>
						<CardContent className="h-fit md:h-200 overflow-y-auto custom-scrollbar">
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
						<CardTitle className="w-full flex justify-between">
							{selectedCostume && selectedCostume}
							<i className="text-red-500 text-xs">work in progress, model might be scuffed</i>
						</CardTitle>
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
