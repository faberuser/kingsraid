"use client"

import { ModelSelector } from "@/components/models/ModelSelector"
import { formatCostumeName } from "@/components/models/utils"

interface CostumeSelectorProps {
	costumeOptions: string[]
	selectedCostume: string
	setSelectedCostume: (costume: string) => void
	heroModels: { [costume: string]: Array<{ type: string }> }
	isLoadingModels: boolean
	isOpen: boolean
}

export function CostumeSelector({
	costumeOptions,
	selectedCostume,
	setSelectedCostume,
	heroModels,
	isLoadingModels,
	isOpen,
}: CostumeSelectorProps) {
	return (
		<ModelSelector
			modelOptions={costumeOptions}
			selectedModel={selectedCostume}
			setSelectedModel={setSelectedCostume}
			models={heroModels}
			isLoadingModels={isLoadingModels}
			isOpen={isOpen}
			formatName={formatCostumeName}
		/>
	)
}
