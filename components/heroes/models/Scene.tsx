"use client"

import { useEffect, useState } from "react"
import { FBXLoader } from "three-stdlib"
import * as THREE from "three"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

export function Scene({ sceneName }: { sceneName: string | null }) {
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
