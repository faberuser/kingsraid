"use client"

import { useRef, useState, useEffect } from "react"
import type React from "react"
import { useFrame } from "@react-three/fiber"
import { FBXLoader } from "three-stdlib"
import * as THREE from "three"
import { ModelFile } from "@/model/Hero_Model"
import { weaponTypes } from "@/components/heroes/models/types"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

type HeroModel = THREE.Group & {
	mixer?: THREE.AnimationMixer
	animations?: THREE.AnimationClip[]
	handPointR?: THREE.Object3D
	handPointL?: THREE.Object3D
}

interface ModelProps {
	modelFiles: ModelFile[]
	visibleModels: Set<string>
	setVisibleModels?: React.Dispatch<React.SetStateAction<Set<string>>>
	selectedAnimation: string | null
	isPaused?: boolean
	setIsLoading?: (loading: boolean) => void
	setLoadingProgress?: (progress: number) => void
	onAnimationDurationChange?: (duration: number) => void
}

export function Model({
	modelFiles,
	visibleModels,
	setVisibleModels,
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
	const currentProgressRef = useRef<number>(0)
	const isLoadingRef = useRef<boolean>(false)
	const previousModelFilesRef = useRef<ModelFile[]>([])

	useEffect(() => {
		// Check if modelFiles have changed (costume switch)
		const modelFilesChanged =
			previousModelFilesRef.current.length !== modelFiles.length ||
			previousModelFilesRef.current.some((prev, idx) => prev.path !== modelFiles[idx]?.path)

		if (modelFilesChanged) {
			// Reset everything when switching costumes
			currentProgressRef.current = 0
			isLoadingRef.current = false
			setLoadedModels(new Map())
			mixersRef.current.clear()
			activeActionsRef.current.clear()
			sharedAnimationsRef.current = []
			previousModelFilesRef.current = [...modelFiles]
		}

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
							const modelProgress = xhr.total > 0 ? xhr.loaded / xhr.total : 0
							// Calculate overall progress considering all models
							const previousModelsProgress = modelIndex / totalModels
							const currentModelContribution = 1 / totalModels
							const totalProgress =
								(previousModelsProgress + modelProgress * currentModelContribution) * 100

							// Ensure progress never goes backwards
							if (totalProgress > currentProgressRef.current) {
								currentProgressRef.current = totalProgress
								if (setLoadingProgress) {
									setLoadingProgress(totalProgress)
								}
							}
						},
						reject
					)
				})

				const modelWithAnimations = fbx as HeroModel
				modelWithAnimations.animations = fbx.animations || []

				// Find hand attachment points for weapon attachment
				fbx.traverse((child) => {
					const childNameLower = child.name.toLowerCase()
					// Look for Point_hand_R/L (proper attachment points)
					if (childNameLower === "point_hand_r") {
						modelWithAnimations.handPointR = child
					} else if (childNameLower === "point_hand_l") {
						modelWithAnimations.handPointL = child
					}
				})

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
					// Weapons will be attached to hand points later
					// Keep at origin for now, don't apply defaultPosition offset
					fbx.position.set(0, 0, 0)
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
			// Prevent multiple simultaneous loads
			if (isLoadingRef.current) return

			// Reset progress tracking at the start
			currentProgressRef.current = 0
			isLoadingRef.current = true

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

			// Load visible models AND all weapon models (even if hidden, we need them to check for animations)
			const modelsToLoad = sortedModels.filter((m) => visibleModels.has(m.name) || weaponTypes.includes(m.type))
			const totalModels = modelsToLoad.length

			for (let i = 0; i < modelsToLoad.length; i++) {
				await loadModel(modelsToLoad[i], i, totalModels)
			}

			// Ensure we reach 100% at the end
			currentProgressRef.current = 100
			if (setLoadingProgress) setLoadingProgress(100)

			if (setIsLoading) setIsLoading(false)
			isLoadingRef.current = false
		}

		loadModelsSequentially()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modelFiles, visibleModels, setIsLoading, setLoadingProgress])

	// Ensure weapons are hidden initially when models finish loading
	useEffect(() => {
		if (loadedModels.size === 0 || !setVisibleModels) return

		// Find all weapon models and ensure they're not in visibleModels initially
		// Skip weapons with defaultPosition (they're part of the body and should stay visible)
		const weaponsToHide = new Set<string>()
		modelFiles.forEach((modelFile) => {
			if (
				weaponTypes.includes(modelFile.type) &&
				!modelFile.defaultPosition &&
				loadedModels.has(modelFile.name)
			) {
				weaponsToHide.add(modelFile.name)
				const weaponModel = loadedModels.get(modelFile.name)
				if (weaponModel) {
					weaponModel.visible = false
				}
			}
		})

		if (weaponsToHide.size > 0) {
			setVisibleModels((prev) => {
				const newSet = new Set(prev)
				weaponsToHide.forEach((name) => newSet.delete(name))
				return newSet
			})
		}
	}, [loadedModels, modelFiles, setVisibleModels])

	// Sync weapon visibility when visibleModels changes (from ControlsPanel toggles)
	useEffect(() => {
		loadedModels.forEach((model, modelName) => {
			const modelFile = modelFiles.find((m) => m.name === modelName)
			const isWeapon = modelFile && weaponTypes.includes(modelFile.type)

			if (isWeapon && !modelFile.defaultPosition) {
				model.visible = visibleModels.has(modelName)
			}
		})
	}, [visibleModels, loadedModels, modelFiles])

	// Attach weapons to hand points after models are loaded
	useEffect(() => {
		const bodyEntry = Array.from(loadedModels.entries()).find(([name]) => {
			const modelFile = modelFiles.find((m) => m.name === name)
			return modelFile?.type === "body"
		})

		if (!bodyEntry) return

		const [, bodyModel] = bodyEntry

		// Skip if hand points are not found yet
		if (!bodyModel.handPointR && !bodyModel.handPointL) {
			return
		}

		// Find weapon models and attach them to hand points
		// Skip weapons with defaultPosition (they're part of the body)
		loadedModels.forEach((weaponModel, weaponName) => {
			const modelFile = modelFiles.find((m) => m.name === weaponName)
			if (!modelFile || !weaponTypes.includes(modelFile.type) || modelFile.defaultPosition) return

			const isLeftHand =
				modelFile.type === "shield" ||
				modelFile.type === "weapon_l" ||
				modelFile.type === "weaponl" ||
				modelFile.type === "weapon02"

			// Try preferred hand first, then fallback to whichever hand exists
			let handPoint = isLeftHand ? bodyModel.handPointL : bodyModel.handPointR
			if (!handPoint) {
				handPoint = isLeftHand ? bodyModel.handPointR : bodyModel.handPointL
			}

			if (handPoint && weaponModel.parent !== handPoint) {
				// Only re-attach if not already attached to this hand point
				if (weaponModel.parent) {
					weaponModel.parent.remove(weaponModel)
				}

				handPoint.add(weaponModel)

				weaponModel.position.set(0, 0, 0)
				weaponModel.scale.set(1, 1, 1)
				weaponModel.rotation.set(Math.PI / 2, 0, 0)
			}
		})
	}, [loadedModels, modelFiles, visibleModels])

	// Handle animation switching
	useEffect(() => {
		// Wait a bit to ensure all models have loaded and shared animations are available
		const timeoutId = setTimeout(() => {
			// Track which weapons should be visible
			const weaponsToShow = new Set<string>()
			const weaponsToHide = new Set<string>()

			// First, collect ALL weapon models to ensure they start in the correct state
			// Exclude weapons with defaultPosition (they're part of the body)
			const allWeaponModels = new Set<string>()
			modelFiles.forEach((modelFile) => {
				if (weaponTypes.includes(modelFile.type) && !modelFile.defaultPosition) {
					allWeaponModels.add(modelFile.name)
				}
			})

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
					const modelFile = modelFiles.find((m) => m.name === modelName)
					const isWeapon = modelFile && weaponTypes.includes(modelFile.type)

					// For weapons, try to find matching weapon animation
					let animationToPlay = selectedAnimation

					// Skip weapon animation logic for weapons with defaultPosition (they're part of the body)
					if (isWeapon && !modelFile.defaultPosition) {
						// Convert body animation to weapon animation
						// Handle two cases:
						// 1. Regular: "Hero_Aisha@Astand_Astand" -> "Hero_Aisha_Weapon@Astand_Astand"
						// 2. Facial: "Hero_Isaiah_Facial@Aimsword_Aimsword" -> "Hero_Isaiah_Weapon_Facial@Aimsword_Aimsword"
						let weaponAnimName: string
						if (selectedAnimation.includes("_Facial@")) {
							weaponAnimName = selectedAnimation.replace(/_Facial@/, "_Weapon_Facial@")
						} else {
							weaponAnimName = selectedAnimation.replace(/@/, "_Weapon@")
						}

						// Check if weapon animation exists in model's animations or shared animations
						const animations =
							model.animations && model.animations.length > 0
								? model.animations
								: sharedAnimationsRef.current

						const weaponClip = animations.find((c) => c.name === weaponAnimName)
						if (weaponClip) {
							animationToPlay = weaponAnimName
							weaponsToShow.add(modelName)
							model.visible = true
						} else {
							weaponsToHide.add(modelName)
							model.visible = false
							return
						}
					}

					// Try to find animation in model's animations first, then in shared animations
					const animations =
						model.animations && model.animations.length > 0 ? model.animations : sharedAnimationsRef.current

					const clip = animations.find((c) => c.name === animationToPlay)
					if (clip) {
						const action = mixer.clipAction(clip)
						action.reset().fadeIn(0.3).play()
						activeActionsRef.current.set(modelName, action)

						// Report animation duration (only from body/non-weapon models)
						if (onAnimationDurationChange && !isWeapon) {
							onAnimationDurationChange(clip.duration)
						}
					}
				} else {
					const modelFile = modelFiles.find((m) => m.name === modelName)
					const isWeapon = modelFile && weaponTypes.includes(modelFile.type)
					if (isWeapon) {
						weaponsToHide.add(modelName)
					}
				}
			})

			// Hide all weapons that weren't marked to show
			allWeaponModels.forEach((weaponName) => {
				if (!weaponsToShow.has(weaponName)) {
					weaponsToHide.add(weaponName)
					const weaponModel = loadedModels.get(weaponName)
					if (weaponModel) {
						weaponModel.visible = false
					}
				}
			})

			// Update visible models set
			if (setVisibleModels && (weaponsToShow.size > 0 || weaponsToHide.size > 0)) {
				setVisibleModels((prev) => {
					const newSet = new Set(prev)
					weaponsToShow.forEach((name) => newSet.add(name))
					weaponsToHide.forEach((name) => newSet.delete(name))
					return newSet
				})
			}
		}, 100)

		return () => clearTimeout(timeoutId)
	}, [selectedAnimation, loadedModels, onAnimationDurationChange, modelFiles, setVisibleModels])

	useFrame((state, delta) => {
		if (!isPaused) {
			mixersRef.current.forEach((mixer) => mixer.update(delta))
		}
	})

	useEffect(() => {
		const mixers = mixersRef.current
		return () => {
			mixers.forEach((mixer) => mixer.stopAllAction())
			mixers.clear()
		}
	}, [])

	return (
		<group ref={groupRef}>
			{Array.from(loadedModels.entries()).map(([name, model]) => {
				const modelFile = modelFiles.find((m) => m.name === name)
				const isWeapon = modelFile && weaponTypes.includes(modelFile.type)

				// For weapons without defaultPosition, always render them (so they stay attached to hand points)
				// but visibility is controlled by model.visible property
				// For weapons with defaultPosition and non-weapons, only render if in visibleModels
				if (isWeapon && !modelFile.defaultPosition) {
					return <primitive key={name} object={model} />
				}

				const isVisible = visibleModels.has(name)
				return isVisible ? <primitive key={name} object={model} /> : null
			})}
		</group>
	)
}
