"use client"

import { useState, useEffect, useRef } from "react"
import { FBXLoader } from "three-stdlib"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ModelViewer } from "@/components/heroes/models/ModelViewer"
import { CostumeSelector } from "@/components/heroes/models/CostumeSelector"
import { ModelsProps } from "@/components/heroes/models/types"
import { formatAnimationName } from "@/components/heroes/models/utils"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

export default function Models({ heroData, heroModels, availableScenes = [] }: ModelsProps) {
	const [selectedCostume, setSelectedCostume] = useState<string>("")
	const [loading, setLoading] = useState(true)
	const [availableAnimations, setAvailableAnimations] = useState<string[]>([])
	const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)
	const [isLoadingModels, setIsLoadingModels] = useState(false)
	const animationsCacheRef = useRef<Map<string, string[]>>(new Map()) // Cache animations per costume

	useEffect(() => {
		// Don't set a default costume - let user choose
		setLoading(false)
	}, [heroModels])

	// Load animations for the selected costume
	useEffect(() => {
		if (!selectedCostume) return

		// Check if we already have animations cached for this costume
		if (animationsCacheRef.current.has(selectedCostume)) {
			const cachedAnimations = animationsCacheRef.current.get(selectedCostume)!
			setAvailableAnimations(cachedAnimations)
			setSelectedAnimation(cachedAnimations[0] || null)
			return
		}

		// Clear animations when switching to uncached costume
		setAvailableAnimations([])
		setSelectedAnimation(null)

		const loadAnimations = async () => {
			const fbxLoader = new FBXLoader()
			const modelDir = `${basePath}/kingsraid-models/models/heroes`

			// Load from the current costume's models - prioritize body, then first available
			const costumeModels = heroModels[selectedCostume]
			if (!costumeModels || costumeModels.length === 0) {
				return
			}

			// Try to find body model first, as it typically has the most complete animation set
			const bodyModel = costumeModels.find((m) => m.type === "body")
			const firstModel = bodyModel || costumeModels[0]

			try {
				const fbx = await new Promise<any>((resolve, reject) => {
					const timeout = setTimeout(() => {
						reject(new Error(`Timeout loading ${firstModel.path}`))
					}, 60000) // 60 second timeout

					fbxLoader.load(
						`${modelDir}/${firstModel.path}`,
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
						.map((clip: any) => clip.name)
						.filter((name: string) => !name.includes("_Weapon@") && !name.includes("Extra"))

					if (animNames.length > 0) {
						// Sort animations before caching and selecting
						const sortedAnimNames = [...animNames].sort((a, b) => {
							return formatAnimationName(a).localeCompare(formatAnimationName(b))
						})

						// Use a microtask to ensure state updates are batched properly
						Promise.resolve().then(() => {
							// Cache the sorted animations for this costume
							animationsCacheRef.current.set(selectedCostume, sortedAnimNames)
							setAvailableAnimations(sortedAnimNames)
							setSelectedAnimation(sortedAnimNames[0])
						})
					} else {
						// Cache empty array for costumes with no animations
						animationsCacheRef.current.set(selectedCostume, [])
					}
				} else {
					// Cache empty array for costumes with no animations
					animationsCacheRef.current.set(selectedCostume, [])
				}
			} catch (error) {
				console.error(`Failed to load animations for costume ${selectedCostume}:`, error)
				// Cache empty array on error to avoid repeated failed loads
				animationsCacheRef.current.set(selectedCostume, [])
			}
		}

		loadAnimations()
	}, [selectedCostume, heroModels])

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
			<div className="w-full lg:w-60 flex-shrink-0 space-y-4">
				<CostumeSelector
					costumeOptions={costumeOptions}
					selectedCostume={selectedCostume}
					setSelectedCostume={setSelectedCostume}
					heroModels={heroModels}
					isLoadingModels={isLoadingModels}
				/>
			</div>

			{/* Main content */}
			<div className="flex-1 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>{selectedCostume || "Select a Model"}</CardTitle>
					</CardHeader>
					<CardContent>
						{!selectedCostume ? (
							<div className="justify-center items-center flex text-muted-foreground lg:h-200 lg:max-h-200">
								Select a costume from the list to view the 3D model
							</div>
						) : currentModels.length > 0 ? (
							<ModelViewer
								key="model-viewer-stable" // Stable key to prevent unmounting
								modelFiles={currentModels}
								availableAnimations={availableAnimations}
								selectedAnimation={selectedAnimation}
								setSelectedAnimation={setSelectedAnimation}
								isLoading={isLoadingModels}
								setIsLoading={setIsLoadingModels}
								availableScenes={availableScenes}
							/>
						) : (
							<div className="justify-center items-center flex text-muted-foreground lg:h-200 lg:max-h-200">
								No models available for this costume
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
