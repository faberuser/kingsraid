"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { FBXLoader } from "three-stdlib"
import { TextureLoader } from "three"
import * as THREE from "three"
import { HeroData } from "@/model/Hero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RotateCcw, ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react"

interface ModelsProps {
	heroData: HeroData
	heroModels: { [costume: string]: ModelFile[] }
}
interface ModelFile {
	name: string
	path: string
	type: "body" | "hair" | "weapon" | "weapon01" | "weapon02"
	textures: {
		diffuse?: string
		normal?: string
		specular?: string
		eye?: string
	}
}

type HeroModel = THREE.Group & {
	mixer?: THREE.AnimationMixer
	animations?: THREE.AnimationClip[]
}

function Model({
	modelFiles,
	heroName,
	visibleModels,
}: {
	modelFiles: ModelFile[]
	heroName: string
	visibleModels: Set<string>
}) {
	const groupRef = useRef<THREE.Group>(null)
	const [loadedModels, setLoadedModels] = useState<Map<string, HeroModel>>(new Map())
	const [mixers, setMixers] = useState<THREE.AnimationMixer[]>([])
	const [loading, setLoading] = useState<Set<string>>(new Set())

	useEffect(() => {
		const loadModel = async (modelFile: ModelFile) => {
			if (loadedModels.has(modelFile.name)) return

			setLoading((prev) => new Set(prev).add(modelFile.name))

			try {
				const fbxLoader = new FBXLoader()
				const textureLoader = new TextureLoader()

				// Load FBX model
				const fbx = await new Promise<THREE.Group>((resolve, reject) => {
					fbxLoader.load(`/models/${modelFile.path}`, resolve, undefined, reject)
				})

				// Load textures using the manifest data
				let mainTexture = null
				let eyeTexture = null
				let normalTexture = null
				let specularTexture = null

				// Load diffuse texture
				if (modelFile.textures.diffuse) {
					try {
						mainTexture = await new Promise<THREE.Texture>((resolve, reject) => {
							textureLoader.load(`/models/${modelFile.textures.diffuse}`, resolve, undefined, reject)
						})
						mainTexture.flipY = true
						console.log(`Successfully loaded diffuse texture: ${modelFile.textures.diffuse}`)
					} catch (error) {
						console.warn(`Failed to load diffuse texture: ${modelFile.textures.diffuse}`)
					}
				}

				// Load eye texture
				if (modelFile.textures.eye) {
					try {
						eyeTexture = await new Promise<THREE.Texture>((resolve, reject) => {
							textureLoader.load(`/models/${modelFile.textures.eye}`, resolve, undefined, reject)
						})
						eyeTexture.flipY = true
						console.log(`Successfully loaded eye texture: ${modelFile.textures.eye}`)
					} catch (error) {
						console.warn(`Failed to load eye texture: ${modelFile.textures.eye}`)
					}
				}

				// Load normal texture (optional)
				if (modelFile.textures.normal) {
					try {
						normalTexture = await new Promise<THREE.Texture>((resolve, reject) => {
							textureLoader.load(`/models/${modelFile.textures.normal}`, resolve, undefined, reject)
						})
						normalTexture.flipY = true
						console.log(`Successfully loaded normal texture: ${modelFile.textures.normal}`)
					} catch (error) {
						console.warn(`Failed to load normal texture: ${modelFile.textures.normal}`)
					}
				}

				// Apply textures to model
				if (mainTexture || eyeTexture) {
					fbx.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							console.log(`Mesh: ${child.name}`)
							if (Array.isArray(child.material)) {
								child.material.forEach((mat, index) => {
									console.log(`Material ${index}: ${mat.name}`)
								})
							} else {
								console.log(`Material: ${child.material.name}`)
							}

							if (child.name.toLowerCase().includes("facial_a") && eyeTexture) {
								let materials = []

								if (Array.isArray(child.material)) {
									// Replace each material based on its name
									materials = child.material.map((originalMat) => {
										const matName = originalMat.name?.toLowerCase() || ""

										if (matName.includes("eye") && eyeTexture) {
											// Eye material - anime style (Blender equivalent)
											return new THREE.MeshToonMaterial({
												map: eyeTexture,
												normalMap: normalTexture,
												name: originalMat.name,
											})
										} else if (mainTexture) {
											// Skin material - anime style (Blender equivalent)
											return new THREE.MeshToonMaterial({
												map: mainTexture,
												normalMap: normalTexture,
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
											normalMap: normalTexture,
										}),
									]
								}

								child.material = materials
							} else if (mainTexture) {
								// Regular single material - anime style (Blender equivalent)
								child.material = new THREE.MeshToonMaterial({
									map: mainTexture,
									normalMap: normalTexture,
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
							child.material = new THREE.MeshBasicMaterial({
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

				// Position models based on type
				switch (modelFile.type) {
					case "body":
						fbx.position.set(0, 0, 0)
						fbx.rotation.x = -Math.PI / 2 // Rotate -90 degrees to make it stand upright
						break
					case "hair":
						fbx.position.set(0, 0, 0)
						fbx.rotation.x = -Math.PI / 2 // Apply same rotation to hair
						break
					case "weapon":
					case "weapon01":
						fbx.position.set(0.5, 0, 0)
						fbx.rotation.x = -Math.PI / 2 // Apply same rotation to weapons
						break
					case "weapon02":
						fbx.position.set(-0.5, 0, 0)
						fbx.rotation.x = -Math.PI / 2 // Apply same rotation to weapons
						break
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

function ModelViewer({ modelFiles, heroName }: { modelFiles: ModelFile[]; heroName: string }) {
	const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 1, 3])
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
		if (controlsRef.current) {
			controlsRef.current.reset()
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

	const showAllModels = () => {
		setVisibleModels(new Set(modelFiles.map((m) => m.name)))
	}

	const hideAllModels = () => {
		setVisibleModels(new Set())
	}

	// Group models by type for better display
	const modelsByType = modelFiles.reduce((acc, model) => {
		if (!acc[model.type]) acc[model.type] = []
		acc[model.type].push(model)
		return acc
	}, {} as Record<string, ModelFile[]>)

	return (
		<div className="space-y-4">
			{/* Costume Info */}
			<div className="bg-muted p-3 rounded-lg">
				<div className="flex items-center justify-between mb-2">
					<h4 className="font-medium">Costume Components</h4>
					<div className="text-sm text-muted-foreground">{modelFiles.length} components available</div>
				</div>
				<div className="flex gap-2 flex-wrap">
					{Object.entries(modelsByType).map(([type, models]) => (
						<span
							key={type}
							className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
						>
							{type} ({models.length})
						</span>
					))}
				</div>
			</div>

			{/* Model Controls */}
			<div className="flex flex-wrap gap-2">
				<Button size="sm" onClick={showAllModels}>
					Show Complete Costume
				</Button>
				<Button size="sm" variant="outline" onClick={hideAllModels}>
					Hide All
				</Button>
			</div>

			{/* Individual Model Toggles */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
				{modelFiles.map((model) => (
					<Button
						key={model.name}
						size="sm"
						variant={visibleModels.has(model.name) ? "default" : "outline"}
						onClick={() => toggleModelVisibility(model.name)}
						className="flex items-center gap-2"
					>
						{visibleModels.has(model.name) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
						<span className="capitalize">{model.type}</span>
					</Button>
				))}
			</div>

			{/* 3D Viewer */}
			<div className="relative w-full h-200 bg-gradient-to-b from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
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
					{/* <directionalLight position={[0, 10, 5]} intensity={0.2} castShadow={false} /> */}
					<Suspense fallback={null}>
						<Model modelFiles={modelFiles} heroName={heroName} visibleModels={visibleModels} />
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
				<CardHeader>
					<CardTitle>3D Models</CardTitle>
				</CardHeader>
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
				<CardHeader>
					<CardTitle>3D Models</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">
						No 3D models available for {heroData.infos.name}
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						3D Models
						<Select value={selectedCostume} onValueChange={setSelectedCostume}>
							<SelectTrigger className="w-64">
								<SelectValue placeholder="Select costume" />
							</SelectTrigger>
							<SelectContent>
								{costumeOptions.map((costume) => (
									<SelectItem key={costume} value={costume}>
										<div className="flex items-center gap-2">
											<span>{formatCostumeName(costume)}</span>
											<span className="text-xs text-muted-foreground">
												({heroModels[costume].length} parts)
											</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{currentModels.length > 0 ? (
						<ModelViewer modelFiles={currentModels} heroName={heroData.infos.name} />
					) : (
						<div className="text-center text-muted-foreground py-8">
							No models available for this costume
						</div>
					)}
				</CardContent>
			</Card>

			{/* Costume Overview */}
			{costumeOptions.length > 1 && (
				<Card>
					<CardHeader>
						<CardTitle>Available Costumes</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{costumeOptions.map((costume) => (
								<div
									key={costume}
									className={`p-3 rounded-lg border cursor-pointer transition-colors ${
										costume === selectedCostume
											? "border-primary bg-primary/5"
											: "border-muted hover:border-primary/50"
									}`}
									onClick={() => setSelectedCostume(costume)}
								>
									<div className="font-medium">{formatCostumeName(costume)}</div>
									<div className="text-sm text-muted-foreground mt-1">
										{heroModels[costume].map((m) => m.type).join(", ")}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
