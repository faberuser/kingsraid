import { Hero } from "@/model/Hero"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useState } from "react"
import { capitalize } from "@/lib/utils"

interface Costume {
	name: string
	path: string
	displayName: string
}

interface CostumesProps {
	heroData: Hero
	costumes: Costume[]
}

export default function Costumes({ heroData, costumes }: CostumesProps) {
	const [selectedCostume, setSelectedCostume] = useState<string | null>(null)

	if (!heroData.costumes) {
		return (
			<div className="text-center text-gray-500 py-8">
				No costume data available for {capitalize(heroData.name)}
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardContent>
					<div className="text-2xl font-bold mb-2">{capitalize(heroData.name)} Costumes</div>
					<Separator className="mb-4" />
					<div className="text-sm text-muted-foreground">Showing {costumes.length} costume variations</div>
				</CardContent>
			</Card>

			{/* Selected Costume Display */}
			{selectedCostume && (
				<Card>
					<CardContent>
						<div className="text-xl font-semibold mb-4">
							{costumes.find((c) => c.name === selectedCostume)?.displayName}
						</div>
						<div className="flex justify-center">
							<div className="relative max-w-md">
								<Image
									src={`/assets/${costumes.find((c) => c.name === selectedCostume)?.path}`}
									alt={`${heroData.name} - ${selectedCostume}`}
									width="0"
									height="0"
									sizes="100vw"
									className="w-auto h-full rounded"
									priority
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Costume Grid */}
			<Card>
				<CardContent>
					<div className="text-xl font-semibold mb-4">Available Costumes</div>
					<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
						{costumes.map((costume) => (
							<CostumeCard
								key={costume.name}
								costume={costume}
								heroName={heroData.name}
								isSelected={selectedCostume === costume.name}
								onClick={() => setSelectedCostume(costume.name)}
							/>
						))}
					</div>

					{costumes.length === 0 && (
						<div className="text-center text-gray-500 py-8">
							<div>No costume images found</div>
							<div className="text-sm mt-2">
								Costume images should be located in: /assets/{heroData.costumes}/
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

interface CostumeCardProps {
	costume: Costume
	heroName: string
	isSelected: boolean
	onClick: () => void
}

function CostumeCard({ costume, heroName, isSelected, onClick }: CostumeCardProps) {
	return (
		<div
			className={`border rounded w-48 h-48 flex flex-col relative cursor-pointer overflow-hidden transition-all duration-200 transform hover:scale-105 ${
				isSelected ? "ring-2 ring-offset-2" : ""
			}`}
			onClick={onClick}
		>
			<Image
				src={`/assets/${costume.path}`}
				alt={`${heroName} - ${costume.displayName}`}
				width="0"
				height="0"
				sizes="100vw"
				className="w-full flex-1 object-cover hover:scale-110 transition-transform duration-300"
			/>
			<div className="text-sm font-bold w-full text-center absolute bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent text-white py-2 flex items-center justify-center">
				{costume.displayName}
			</div>
		</div>
	)
}
