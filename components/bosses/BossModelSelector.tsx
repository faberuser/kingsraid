"use client"

import { ModelSelector } from "@/components/models/ModelSelector"
import { formatModelName } from "@/components/models/utils"

interface BossModelSelectorProps {
	modelOptions: string[]
	selectedModel: string
	setSelectedModel: (model: string) => void
	bossModels: { [variant: string]: Array<{ type: string }> }
	isLoadingModels: boolean
	isOpen: boolean
}

export function BossModelSelector({
	modelOptions,
	selectedModel,
	setSelectedModel,
	bossModels,
	isLoadingModels,
	isOpen,
}: BossModelSelectorProps) {
	return (
		<ModelSelector
			modelOptions={modelOptions}
			selectedModel={selectedModel}
			setSelectedModel={setSelectedModel}
			models={bossModels}
			isLoadingModels={isLoadingModels}
			isOpen={isOpen}
			formatName={formatModelName}
		/>
	)
}
