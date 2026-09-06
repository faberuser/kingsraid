"use client"

import { useState } from "react"
import { ModelViewer } from "@/app/heroes/components/models/ModelViewer"
import { ModelSelector } from "@/app/heroes/components/models/ModelSelector"
import type { ModelFile } from "@/model/Hero_Model"

const animations: string[] = []
const scenes = [{ value: "grid", label: "Grid" }]
const modelOptions = ["default"]

export default function ArtifactModels({
	modelFiles,
	artifactName,
}: {
	modelFiles: ModelFile[]
	artifactName: string
}) {
	const [isLoading, setIsLoading] = useState(false)
	const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null)
	const [selectedModel, setSelectedModel] = useState("")

	return (
		<div className="space-y-6">
			{selectedModel ? (
				<ModelViewer
					modelFiles={modelFiles}
					modelType="artifacts"
					availableScenes={scenes}
					availableAnimations={animations}
					selectedAnimation={selectedAnimation}
					setSelectedAnimation={setSelectedAnimation}
					isLoading={isLoading}
					setIsLoading={setIsLoading}
				/>
			) : (
				<div className="flex items-center justify-center text-muted-foreground h-120 lg:h-200 border rounded-lg">
					Select a model from the list to view the 3D model
				</div>
			)}
			<ModelSelector
				modelOptions={modelOptions}
				selectedModel={selectedModel}
				setSelectedModel={setSelectedModel}
				models={{ default: modelFiles }}
				isLoadingModels={isLoading}
				isOpen={true}
				formatName={() => artifactName}
			/>
		</div>
	)
}
