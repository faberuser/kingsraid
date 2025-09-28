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

				// Try to load corresponding texture
				const texturePath = `/models/${modelFile.path.replace(".fbx", "_D(RGB).png")}`
				try {
					const texture = await new Promise<THREE.Texture>((resolve, reject) => {
						textureLoader.load(texturePath, resolve, undefined, reject)
					})

					texture.flipY = true

					// For body models, also try to load eye texture
					let eyeTexture = null
					if (modelFile.type === "body") {
						try {
							// Extract hero name from path (e.g., Hero_Aisha_Cos16SL_Body.fbx -> Aisha)
							const heroNameMatch = modelFile.path.match(/Hero_([^_]+)_/)
							if (heroNameMatch) {
								const heroName = heroNameMatch[1]
								const pathParts = modelFile.path.replace(/\\/g, "/").split("/")
								const modelFolder = pathParts[0] // Get the first part (folder name)
								// Try multiple eye texture naming patterns
								const eyeTexturePaths = [
									`/models/${modelFolder}/Hero_${heroName}_Facial_Eye_01_D(RGB).png`, // New pattern
									`/models/${modelFolder}/Hero_${heroName}_Eye_01_D(RGB).png`, // Alternative with D(RGB)
									`/models/${modelFolder}/Hero_${heroName}_Eye_01_D.png`, // Original pattern
								]

								// Try loading eye texture with different naming patterns
								for (const eyeTexturePath of eyeTexturePaths) {
									try {
										console.log(`Trying eye texture: ${eyeTexturePath}`)
										eyeTexture = await new Promise<THREE.Texture>((resolve, reject) => {
											textureLoader.load(eyeTexturePath, resolve, undefined, reject)
										})

										eyeTexture.flipY = true
										console.log(`Successfully loaded eye texture: ${eyeTexturePath}`)
										break // Stop trying once we find one that works
									} catch (individualEyeError) {
										console.warn(`Eye texture not found at: ${eyeTexturePath}`)
										continue // Try the next pattern
									}
								}
							}
						} catch (eyeError) {
							console.warn(`Eye texture not found for ${modelFile.name}`)
						}
					}

					// Apply textures to model
					fbx.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							console.log(`Found mesh: ${child.name}`)
							if (child.name.toLowerCase().includes("facial_a") && eyeTexture) {
								let materials = []

								if (Array.isArray(child.material)) {
									// Replace each material based on its name
									materials = child.material.map((originalMat) => {
										const matName = originalMat.name?.toLowerCase() || ""

										if (matName.includes("eye")) {
											// Eye material - anime style (Blender equivalent)
											return new THREE.MeshStandardMaterial({
												map: eyeTexture,
												metalness: 0.0, // Same as Blender
												roughness: 1.0, // Same as Blender
												name: originalMat.name,
											})
										} else {
											// Skin material - anime style (Blender equivalent)
											return new THREE.MeshStandardMaterial({
												map: texture,
												metalness: 0.0, // Same as Blender
												roughness: 1.0, // Same as Blender
												name: originalMat.name,
											})
										}
									})
								} else {
									// Single material, check if it's eye or skin
									const matName = child.material.name?.toLowerCase() || ""
									const useEyeTexture = matName.includes("eye")

									materials = [
										new THREE.MeshStandardMaterial({
											map: useEyeTexture ? eyeTexture : texture,
											metalness: 0.0, // Same as Blender
											roughness: 1.0, // Same as Blender
										}),
									]
								}

								child.material = materials
							} else {
								// Regular single material - anime style (Blender equivalent)
								child.material = new THREE.MeshStandardMaterial({
									map: texture,
									metalness: 0.0, // Same as Blender
									roughness: 1.0, // Same as Blender
								})
							}

							child.castShadow = false
							child.receiveShadow = false
						}
					})
				} catch (textureError) {
					console.warn(`Texture not found for ${modelFile.name}, using default material`)
					// Apply default material if texture fails
					fbx.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							child.material = new THREE.MeshStandardMaterial({
								color: 0xcccccc,
								metalness: 0.1,
								roughness: 0.8,
							})
							child.castShadow = true
							child.receiveShadow = true
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
		// Start with only body model visible
		const bodyModel = modelFiles.find((m) => m.type === "body")
		if (bodyModel) {
			setVisibleModels(new Set([bodyModel.name]))
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

	return (
		<div className="space-y-4">
			{/* Model Controls */}
			<div className="flex flex-wrap gap-2">
				<Button size="sm" onClick={showAllModels}>
					Show All
				</Button>
				<Button size="sm" variant="outline" onClick={hideAllModels}>
					Hide All
				</Button>
			</div>

			{/* Individual Model Toggles */}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
				{modelFiles.map((model) => (
					<Button
						key={model.name}
						size="sm"
						variant={visibleModels.has(model.name) ? "default" : "outline"}
						onClick={() => toggleModelVisibility(model.name)}
						className="flex items-center gap-2"
					>
						{visibleModels.has(model.name) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
						<span className="capitalize">{model.name}</span>
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
					{/* Anime-style lighting */}
					<ambientLight intensity={1} />
					<directionalLight
						position={[0, 10, 5]}
						intensity={1}
						castShadow={false} // Disable shadows for anime look
					/>
					{/* Remove other lights or reduce their intensity */}
					{/* <pointLight position={[5, 5, 5]} intensity={0.2} /> */}
					<Suspense fallback={null}>
						<Model modelFiles={modelFiles} heroName={heroName} visibleModels={visibleModels} />
						{/* <Environment preset="sunset" /> */}
					</Suspense>
					<gridHelper args={[10, 10]} />
					{/* <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
						<planeGeometry args={[20, 20]} />
						<shadowMaterial opacity={0.3} />
					</mesh> */}
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
		// Set default costume
		const costumes = Object.keys(heroModels)
		if (costumes.length > 0) {
			setSelectedCostume(costumes[0])
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

	const costumeOptions = Object.keys(heroModels)
	const currentModels = selectedCostume ? heroModels[selectedCostume] || [] : []

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
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Select costume" />
							</SelectTrigger>
							<SelectContent>
								{costumeOptions.map((costume) => (
									<SelectItem key={costume} value={costume}>
										{costume.replace(/^Hero_\w+_/, "").replace(/_/g, " ")}
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

			{currentModels.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Model Components</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
							{currentModels.map((model) => (
								<div key={model.name} className="flex items-center gap-2 p-2 bg-muted rounded">
									<div className="text-sm font-medium capitalize">{model.type}</div>
									<div className="text-xs text-muted-foreground truncate">{model.name}</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
