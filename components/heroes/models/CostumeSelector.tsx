"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCostumeName } from "@/components/heroes/models/utils"

interface CostumeSelectorProps {
	costumeOptions: string[]
	selectedCostume: string
	setSelectedCostume: (costume: string) => void
	heroModels: { [costume: string]: Array<{ type: string }> }
	isLoadingModels: boolean
}

export function CostumeSelector({
	costumeOptions,
	selectedCostume,
	setSelectedCostume,
	heroModels,
	isLoadingModels,
}: CostumeSelectorProps) {
	if (costumeOptions.length <= 1) {
		return null
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Models ({costumeOptions.length} variants)</CardTitle>
			</CardHeader>
			<CardContent className="h-fit lg:h-200 overflow-y-auto custom-scrollbar">
				<div className="grid grid-cols-1 gap-2">
					{[...costumeOptions]
						.sort((a, b) => {
							const aIsVari = a.startsWith("Vari")
							const bIsVari = b.startsWith("Vari")

							// If one is Vari and the other isn't, put Vari at the bottom
							if (aIsVari && !bIsVari) return 1
							if (!aIsVari && bIsVari) return -1

							// Otherwise, sort alphabetically by formatted name
							return formatCostumeName(a).localeCompare(formatCostumeName(b))
						})
						.map((costume) => (
							<div
								key={costume}
								className={`p-2 rounded-lg border transition-colors ${
									costume === selectedCostume
										? "border-primary bg-primary/5"
										: "border-muted hover:border-primary/50"
								} ${isLoadingModels ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
								onClick={() => !isLoadingModels && setSelectedCostume(costume)}
							>
								<div className="font-medium">{formatCostumeName(costume)}</div>
								<div className="text-xs text-muted-foreground mt-1">
									{heroModels[costume]
										.map((m) => m.type)
										.sort((a, b) => a.localeCompare(b))
										.join(", ")}
								</div>
							</div>
						))}
				</div>
			</CardContent>
		</Card>
	)
}
