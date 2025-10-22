"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { FBXLoader } from "three-stdlib"
import * as THREE from "three"
import { ModelFile } from "@/model/Hero_Model"
import { weaponTypes } from "./types"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

type HeroModel = THREE.Group & {
	mixer?: THREE.AnimationMixer
	animations?: THREE.AnimationClip[]
}

interface ModelProps {
	modelFiles: ModelFile[]
	visibleModels: Set<string>
	selectedAnimation: string | null
	isPaused?: boolean
	setIsLoading?: (loading: boolean) => void
	setLoadingProgress?: (progress: number) => void
	onAnimationDurationChange?: (duration: number) => void
}

export function Model({
	modelFiles,
	visibleModels,
	selectedAnimation,
	isPaused,
	setIsLoading,
	setLoadingProgress,
	onAnimationDurationChange,
}: ModelProps) {
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

						// Report animation duration
						if (onAnimationDurationChange) {
							onAnimationDurationChange(clip.duration)
						}
					}
				}
			})
		}, 100)

		return () => clearTimeout(timeoutId)
	}, [selectedAnimation, loadedModels, onAnimationDurationChange])

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
