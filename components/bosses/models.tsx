"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { FBXLoader } from "three-stdlib"
import { AnimationClip, Group } from "three"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelViewer } from "@/components/models/ModelViewer"
import { ModelFile } from "@/model/Hero_Model"
import { formatAnimationName } from "@/components/models/utils"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

interface BossModelData {
	mesh: ModelFile | null
}

interface BossModelsProps {
	bossModels: BossModelData
	bossScenes?: Array<{ value: string; label: string }>
	bossName: string
}

export default function BossModels({ bossModels, bossScenes = [], bossName }: BossModelsProps) {
	const [availableAnimations, setAvailableAnimations] = useState<string[]>([])
	const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)
	const [isLoadingModels, setIsLoadingModels] = useState(false)
	const [visibleModels, setVisibleModels] = useState<Set<string>>(() => {
		// Initialize with the boss mesh name if available
		return bossModels.mesh ? new Set([bossModels.mesh.name]) : new Set()
	})
	const animationsLoadedRef = useRef(false)

	// Load animations from the boss mesh
	useEffect(() => {
		if (!bossModels.mesh || animationsLoadedRef.current) return

		const loadAnimations = async () => {
			const fbxLoader = new FBXLoader()
			const modelDir = `${basePath}/kingsraid-models/models/bosses`

			try {
				const fbx = await new Promise<Group>((resolve, reject) => {
					const timeout = setTimeout(() => {
						reject(new Error(`Timeout loading ${bossModels.mesh!.path}`))
					}, 60000) // 60 second timeout

					fbxLoader.load(
						`${modelDir}/${bossModels.mesh!.path}`,
						(loadedFbx) => {
							clearTimeout(timeout)
							resolve(loadedFbx)
						},
						undefined,
						(error) => {
							clearTimeout(timeout)
							reject(error)
						}
					)
				})

				if (fbx.animations && fbx.animations.length > 0) {
					const animNames = fbx.animations
						.map((clip: AnimationClip) => clip.name)
						.filter((name: string) => !name.includes("Extra"))
						.filter((name: string) => !name.includes("_Weapon@"))

					if (animNames.length > 0) {
						const sortedAnimNames = [...animNames].sort((a, b) => {
							return formatAnimationName(a).localeCompare(formatAnimationName(b))
						})

						// Move idle animation to the top if it exists
						const idleIndex = sortedAnimNames.findIndex(
							(name) => name.includes("Idle") || name.includes("idle")
						)
						if (idleIndex > 0) {
							const idle = sortedAnimNames.splice(idleIndex, 1)[0]
							sortedAnimNames.unshift(idle)
						}

						setAvailableAnimations(sortedAnimNames)
						setSelectedAnimation(sortedAnimNames[0])
						animationsLoadedRef.current = true
					}
				}
			} catch (error) {
				console.error(`Failed to load animations for boss:`, error)
			}
		}

		loadAnimations()
	}, [bossModels.mesh])

	// All available models - just the boss mesh
	const allModels = useMemo(() => {
		const models: ModelFile[] = []
		if (bossModels.mesh) models.push(bossModels.mesh)
		return models
	}, [bossModels.mesh])

	if (!bossModels.mesh) {
		return (
			<Card>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">No 3D models available for this boss</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Boss Model</CardTitle>
			</CardHeader>
			<CardContent>
				<ModelViewer
					key="boss-model-viewer-stable"
					modelFiles={allModels}
					availableAnimations={availableAnimations}
					selectedAnimation={selectedAnimation}
					setSelectedAnimation={setSelectedAnimation}
					isLoading={isLoadingModels}
					setIsLoading={setIsLoadingModels}
					availableScenes={bossScenes}
					modelType="bosses"
					visibleModels={visibleModels}
					setVisibleModels={setVisibleModels}
					bossName={bossName}
				/>
			</CardContent>
		</Card>
	)
}
