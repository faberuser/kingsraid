import { useState, useEffect } from "react"
import { Hero } from "@/model/Hero"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { capitalize } from "@/lib/utils"
import { ZoomIn } from "lucide-react"
import ImageZoomModal from "@/components/image-modal"

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
	const [isModalOpen, setIsModalOpen] = useState(false)

	// Auto-select first costume when costumes are available
	useEffect(() => {
		if (costumes.length > 0 && !selectedCostume) {
			setSelectedCostume(costumes[0].name)
		}
	}, [costumes, selectedCostume])

	const handleImageClick = () => {
		setIsModalOpen(true)
	}

	if (!heroData.costumes) {
		return (
			<div className="text-center text-muted-foreground py-8">
				No costume data available for {capitalize(heroData.name)}
			</div>
		)
	}

	const selectedCostumeData = costumes.find((c) => c.name === selectedCostume)

	return (
		<div className="space-y-6">
			{/* Main Layout - Side by side */}
			<div className="flex flex-col md:flex-row gap-6">
				{/* Available Costumes - Left Side */}
				<Card>
					<CardContent>
						<div className="text-xl font-semibold mb-4">Costumes ({costumes.length} variations)</div>
						<div className="flex items-center justify-center">
							<div className="max-h-[450px] custom-scrollbar overflow-y-auto overflow-x-hidden space-y-3 p-2">
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
						</div>

						{costumes.length === 0 && (
							<div className="text-center text-muted-foreground py-8">
								<div>No costume images found</div>
								<div className="text-sm mt-2">
									Costume images should be located in: /assets/{heroData.costumes}/
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Selected Costume Display - Right Side */}
				<div className="flex-1">
					{selectedCostume && selectedCostumeData ? (
						<Card>
							<CardContent>
								<div className="text-xl font-semibold mb-4">{selectedCostumeData.displayName}</div>
								<div className="flex justify-center">
									<div
										className="relative max-w-md cursor-pointer hover:opacity-90 transition-opacity"
										onClick={handleImageClick}
									>
										<Image
											src={`/assets/${selectedCostumeData.path}`}
											alt={`${heroData.name} - ${selectedCostume}`}
											width="0"
											height="0"
											sizes="100vw"
											className="w-auto h-full"
											priority
										/>
										<div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
											<ZoomIn className="w-12 h-12 text-white" />
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent>
								<div className="flex items-center justify-center h-64 text-gray-500">
									<div className="text-center">
										<div className="text-lg">Select a costume to view</div>
										<div className="text-sm mt-2">
											Choose from the available costumes on the left
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>

			{/* Zoom Modal */}
			{selectedCostumeData && (
				<ImageZoomModal
					isOpen={isModalOpen}
					onOpenChange={setIsModalOpen}
					imageSrc={`/assets/${selectedCostumeData.path}`}
					imageAlt={`${heroData.name} - ${selectedCostume}`}
					title={`${capitalize(heroData.name)} - ${selectedCostumeData.displayName}`}
				/>
			)}
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
			className={`border rounded w-50 h-50 flex flex-col relative cursor-pointer overflow-hidden transition-all duration-200 transform hover:scale-105 ${
				isSelected ? "ring-2" : ""
			}`}
			onClick={onClick}
		>
			<Image
				src={`/assets/${costume.path}`}
				alt={`${heroName} - ${costume.displayName}`}
				width="0"
				height="0"
				sizes="40vw md:20vw"
				className="w-full flex-1 hover:scale-110 transition-transform duration-300"
			/>
			<div className="text-sm font-bold w-full text-center absolute bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent text-white py-2 flex items-center justify-center">
				{costume.displayName}
			</div>
		</div>
	)
}
