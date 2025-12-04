"use client"

import { useRef, useState, useEffect } from "react"
import type React from "react"
import { useFrame } from "@react-three/fiber"
import { FBXLoader } from "three-stdlib"
import * as THREE from "three"
import { ModelFile } from "@/model/Hero_Model"
import { weaponTypes } from "@/components/models/types"
import { loadBossOffsetConfig } from "@/components/models/bossOffsetConfig"

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
	modelType?: "heroes" | "bosses"
	bossName?: string
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
	modelType = "heroes",
	bossName,
}: ModelProps) {
	const groupRef = useRef<THREE.Group>(null)
	const [loadedModels, setLoadedModels] = useState<Map<string, HeroModel>>(new Map())
	const mixersRef = useRef<Map<string, THREE.AnimationMixer>>(new Map())
	const activeActionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map())
	const sharedAnimationsRef = useRef<THREE.AnimationClip[]>([])
	const currentProgressRef = useRef<number>(0)
	const isLoadingRef = useRef<boolean>(false)
	const previousModelFilesRef = useRef<ModelFile[]>([])
	const [bossConfig, setBossConfig] = useState<Awaited<ReturnType<typeof loadBossOffsetConfig>>>(null)
	const attachedWeaponsRef = useRef<Set<string>>(new Set()) // Track which weapons have been attached
	const frameCountRef = useRef<number>(0) // Count frames to wait for skeleton stability

	// Load boss offset config for boss models
	useEffect(() => {
		if (modelType === "bosses" && bossName) {
			loadBossOffsetConfig(bossName).then((config) => {
				setBossConfig(config)
			})
		}
	}, [modelType, bossName])

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
			attachedWeaponsRef.current.clear() // Reset attached weapons tracking
			frameCountRef.current = 0 // Reset frame counter for weapon attachment
			previousModelFilesRef.current = [...modelFiles]
		}

		const loadModel = async (modelFile: ModelFile, modelIndex: number, totalModels: number) => {
			if (loadedModels.has(modelFile.name)) return
			const modelDir = `${basePath}/kingsraid-models/models/${modelType}`

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
					// Also try variations like Point_Hand_R, point_Hand_R, etc.
					if (
						childNameLower.includes("point") &&
						childNameLower.includes("hand") &&
						childNameLower.includes("r")
					) {
						modelWithAnimations.handPointR = child
					} else if (
						childNameLower.includes("point") &&
						childNameLower.includes("hand") &&
						childNameLower.includes("l")
					) {
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

					// Apply boss model offsets if available
					if (modelType === "bosses" && bossName) {
						const config = await loadBossOffsetConfig(bossName)
						const modelOffset = config?.model

						// Apply scale (default 1 for boss models, or from config)
						const scaleValue = modelOffset?.scale || { x: 1, y: 1, z: 1 }
						fbx.scale.set(scaleValue.x ?? 1, scaleValue.y ?? 1, scaleValue.z ?? 1)

						// Apply position offset if provided
						if (modelOffset?.position) {
							fbx.position.set(
								modelOffset.position.x ?? 0,
								modelOffset.position.y ?? 0,
								modelOffset.position.z ?? 0
							)
						}

						// Apply rotation offset if provided (in radians)
						if (modelOffset?.rotation) {
							fbx.rotation.set(
								modelOffset.rotation.x ?? 0,
								modelOffset.rotation.y ?? 0,
								modelOffset.rotation.z ?? 0
							)
						}
					} else if (modelType === "bosses") {
						// Default scale for bosses if no config
						fbx.scale.set(1, 1, 1)
					}
				} else if (weaponTypes.includes(modelFile.type)) {
					// Apply boss transformations to weapons
					if (modelType === "bosses" && bossName) {
						// Check if weapon has defaultPosition set (from getBossModels)
						if (modelFile.defaultPosition) {
							// Apply the same scale as the body model from offset.json
							const config = await loadBossOffsetConfig(bossName)
							const modelOffset = config?.model
							const scaleValue = modelOffset?.scale || { x: 1, y: 1, z: 1 }

							// Apply body's scale to weapon so they match
							fbx.scale.set(scaleValue.x ?? 1, scaleValue.y ?? 1, scaleValue.z ?? 1)

							// Apply weapon rotation correction from offset.json if provided
							const weaponOffset = config?.weapon
							if (weaponOffset?.rotation) {
								fbx.rotation.set(
									weaponOffset.rotation.x ?? fbx.rotation.x,
									weaponOffset.rotation.y ?? fbx.rotation.y,
									weaponOffset.rotation.z ?? fbx.rotation.z
								)
							}

							// Keep FBX's original position
							fbx.updateMatrixWorld(true)
						} else {
							// Weapon needs hand attachment - start invisible until attached
							fbx.visible = false

							// Load config for weapons that need hand attachment
							const config = await loadBossOffsetConfig(bossName)
							const modelOffset = config?.model
							const scaleValue = modelOffset?.scale || { x: 1, y: 1, z: 1 }
							fbx.scale.set(scaleValue.x ?? 1, scaleValue.y ?? 1, scaleValue.z ?? 1)
							// Keep at origin for hand attachment
							fbx.position.set(0, 0, 0)
						}
					} else if (modelType === "bosses") {
						// Boss weapon without config - needs hand attachment, start invisible
						if (!modelFile.defaultPosition) {
							fbx.visible = false
						}

						fbx.scale.set(1, 1, 1)
						fbx.position.set(0, 0, 0)

						// Force matrix update
						fbx.updateMatrix()
						fbx.updateMatrixWorld(true)
					} else {
						// Hero weapons will be attached to hand points later - start invisible
						if (!modelFile.defaultPosition) {
							fbx.visible = false
						}

						// Weapons will be attached to hand points later
						// Keep at origin for now
						fbx.position.set(0, 0, 0)
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

	// Ensure weapons visibility based on model type (only run once after initial load)
	useEffect(() => {
		if (loadedModels.size === 0 || !setVisibleModels) return

		// For heroes: hide weapons initially (user toggles them on)
		if (modelType === "heroes") {
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
		}
		// For bosses: weapons should already be in visibleModels from ModelViewer initialization
		// The sync effect below will handle visibility based on visibleModels
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadedModels.size, modelType]) // Only run when models finish loading or modelType changes

	// Parent weapons with defaultPosition to body model so they inherit transforms
	useEffect(() => {
		if (modelType !== "bosses") return

		const bodyEntry = Array.from(loadedModels.entries()).find(([name]) => {
			const modelFile = modelFiles.find((m) => m.name === name)
			return modelFile?.type === "body"
		})

		if (bodyEntry) {
			const [, bodyModel] = bodyEntry

			loadedModels.forEach((weaponModel, weaponName) => {
				const modelFile = modelFiles.find((m) => m.name === weaponName)
				if (!modelFile || !weaponTypes.includes(modelFile.type) || !modelFile.defaultPosition) return

				if (weaponModel.parent !== bodyModel) {
					// Convert weapon's world position to be relative to body
					const weaponWorldPos = weaponModel.position.clone()
					const weaponWorldRot = weaponModel.rotation.clone()
					const weaponWorldScale = weaponModel.scale.clone()

					bodyModel.add(weaponModel)

					// Restore world transforms as local transforms relative to body
					weaponModel.position.copy(weaponWorldPos)
					weaponModel.rotation.copy(weaponWorldRot)
					weaponModel.scale.copy(weaponWorldScale)
					weaponModel.updateMatrix()
				}
			})
		}
	}, [loadedModels, modelFiles, modelType])

	// Sync weapon visibility when visibleModels changes (from ControlsPanel toggles)
	useEffect(() => {
		loadedModels.forEach((model, modelName) => {
			const modelFile = modelFiles.find((m) => m.name === modelName)
			const isWeapon = modelFile && weaponTypes.includes(modelFile.type)

			if (isWeapon && !modelFile.defaultPosition) {
				const shouldBeVisible = visibleModels.has(modelName)

				// Don't make weapon visible if it hasn't been attached yet
				if (shouldBeVisible && !attachedWeaponsRef.current.has(modelName)) {
					return
				}

				if (model.visible !== shouldBeVisible) {
					model.visible = shouldBeVisible
				}
			}
		})
	}, [visibleModels, loadedModels, modelFiles])

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
					// For heroes without animation selected, hide weapons
					// For bosses, keep weapons visible by default
					if (isWeapon && modelType === "heroes") {
						weaponsToHide.add(modelName)
					}
				}
			})

			// Hide all weapons that weren't marked to show (only for heroes)
			// For bosses, keep weapons visible unless explicitly hidden
			if (modelType === "heroes") {
				allWeaponModels.forEach((weaponName) => {
					if (!weaponsToShow.has(weaponName)) {
						weaponsToHide.add(weaponName)
						const weaponModel = loadedModels.get(weaponName)
						if (weaponModel) {
							weaponModel.visible = false
						}
					}
				})
			}

			// Update visible models set
			if (setVisibleModels && (weaponsToShow.size > 0 || weaponsToHide.size > 0)) {
				setVisibleModels((prev) => {
					const newSet = new Set(prev)
					weaponsToShow.forEach((name) => newSet.add(name))
					// For bosses, only remove weapons from visibleModels if they were explicitly marked to hide
					// For heroes, remove all weapons in weaponsToHide
					if (modelType === "heroes") {
						weaponsToHide.forEach((name) => newSet.delete(name))
					}
					return newSet
				})
			}
		}, 100)

		return () => clearTimeout(timeoutId)
	}, [selectedAnimation, loadedModels, onAnimationDurationChange, modelFiles, setVisibleModels, modelType])

	useFrame((state, delta) => {
		// UPDATE ANIMATION MIXERS FIRST before weapon attachment
		// This ensures hand bones are in animated pose, not bind pose
		if (!isPaused) {
			mixersRef.current.forEach((mixer) => mixer.update(delta))
		}

		// Reattach weapons to hand points for the first 10 frames to ensure skeleton stability
		const FRAMES_TO_REATTACH = 10

		const bodyEntry = Array.from(loadedModels.entries()).find(([name]) => {
			const modelFile = modelFiles.find((m) => m.name === name)
			return modelFile?.type === "body"
		})

		if (bodyEntry && frameCountRef.current < FRAMES_TO_REATTACH) {
			const [, bodyModel] = bodyEntry

			// Check if an animation is actually playing on the body
			const bodyMixer = mixersRef.current.get(bodyEntry[0])
			const hasActiveAnimation = bodyMixer && activeActionsRef.current.size > 0

			// Only attach weapons if animation is playing (hand bone in correct pose)
			if (!hasActiveAnimation) {
				// Animation not started yet, skip this frame
				return
			}

			// Check if hand points exist and weapons are loaded
			if (bodyModel.handPointR || bodyModel.handPointL) {
				const weaponsNeedingAttachment = modelFiles.filter(
					(mf) => weaponTypes.includes(mf.type) && !mf.defaultPosition
				)
				const allWeaponsLoaded = weaponsNeedingAttachment.every((mf) => loadedModels.has(mf.name))

				if (allWeaponsLoaded && weaponsNeedingAttachment.length > 0) {
					frameCountRef.current++

					// Reattach weapons every frame for first FRAMES_TO_REATTACH frames
					loadedModels.forEach((weaponModel, weaponName) => {
						const modelFile = modelFiles.find((m) => m.name === weaponName)
						if (!modelFile || !weaponTypes.includes(modelFile.type) || modelFile.defaultPosition) return

						const isLeftHand =
							modelFile.type === "shield" ||
							modelFile.type === "weapon_l" ||
							modelFile.type === "weaponl" ||
							modelFile.type === "weapon02"

						let handPoint = isLeftHand ? bodyModel.handPointL : bodyModel.handPointR
						if (!handPoint) {
							handPoint = isLeftHand ? bodyModel.handPointR : bodyModel.handPointL
						}

						if (handPoint) {
							// Remove from current parent if attached
							if (weaponModel.parent) {
								weaponModel.parent.remove(weaponModel)
							}

							// Use weapon rotation from config if available, otherwise default to 90 degrees
							const weaponRotation = bossConfig?.weapon?.rotation || { x: Math.PI / 2, y: 0, z: 0 }

							weaponModel.position.set(0, 0, 0)
							weaponModel.scale.set(1, 1, 1)
							weaponModel.rotation.set(
								weaponRotation.x ?? Math.PI / 2,
								weaponRotation.y ?? 0,
								weaponRotation.z ?? 0
							)
							weaponModel.updateMatrix()

							handPoint.add(weaponModel)
							attachedWeaponsRef.current.add(weaponName)
							weaponModel.visible = true
						}
					})
				}
			}
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
