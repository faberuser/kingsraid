import { useState, useEffect, useRef, useCallback } from "react"
import { Hero } from "@/model/Hero"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { capitalize } from "@/lib/utils"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface Costume {
	name: string
	path: string
	displayName: string
}

interface CostumesProps {
	heroData: Hero
	costumes: Costume[]
}

const MAX_ZOOM_IN = 10
const MAX_ZOOM_OUT = 1

export default function Costumes({ heroData, costumes }: CostumesProps) {
	const [selectedCostume, setSelectedCostume] = useState<string | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [zoomLevel, setZoomLevel] = useState(1)
	const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
	const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 })

	const imageContainerRef = useRef<HTMLDivElement>(null)

	// Auto-select first costume when costumes are available
	useEffect(() => {
		if (costumes.length > 0 && !selectedCostume) {
			setSelectedCostume(costumes[0].name)
		}
	}, [costumes, selectedCostume])

	const handleImageClick = () => {
		setIsModalOpen(true)
		setZoomLevel(1)
		setPanPosition({ x: 0, y: 0 })
	}

	const handleZoomIn = () => {
		setZoomLevel((prev) => Math.min(prev + 0.25, MAX_ZOOM_IN))
	}

	const handleZoomOut = () => {
		setZoomLevel((prev) => {
			const newZoom = Math.max(prev - 0.25, MAX_ZOOM_OUT)
			if (newZoom === 1) {
				setPanPosition({ x: 0, y: 0 })
			}
			return newZoom
		})
	}

	const handleResetZoom = () => {
		setZoomLevel(1)
		setPanPosition({ x: 0, y: 0 })
	}

	// Scroll wheel zoom
	const handleWheel = useCallback((e: React.WheelEvent) => {
		const zoomSpeed = 0.1
		const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed

		setZoomLevel((prev) => {
			const newZoom = Math.max(MAX_ZOOM_OUT, Math.min(MAX_ZOOM_IN, prev + delta))
			if (newZoom === 1) {
				setPanPosition({ x: 0, y: 0 })
			}
			return newZoom
		})
	}, [])

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (zoomLevel > 1) {
				setIsDragging(true)
				setDragStart({ x: e.clientX, y: e.clientY })
				setLastPanPosition(panPosition)
			}
		},
		[zoomLevel, panPosition]
	)

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (isDragging && zoomLevel > 1) {
				const deltaX = e.clientX - dragStart.x
				const deltaY = e.clientY - dragStart.y

				setPanPosition({
					x: lastPanPosition.x + deltaX,
					y: lastPanPosition.y + deltaY,
				})
			}
		},
		[isDragging, dragStart, lastPanPosition, zoomLevel]
	)

	const handleMouseUp = useCallback(() => {
		setIsDragging(false)
	}, [])

	// Touch events for mobile support
	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			if (zoomLevel > 1 && e.touches.length === 1) {
				setIsDragging(true)
				setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
				setLastPanPosition(panPosition)
			}
		},
		[zoomLevel, panPosition]
	)

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
				const deltaX = e.touches[0].clientX - dragStart.x
				const deltaY = e.touches[0].clientY - dragStart.y

				setPanPosition({
					x: lastPanPosition.x + deltaX,
					y: lastPanPosition.y + deltaY,
				})
			}
		},
		[isDragging, dragStart, lastPanPosition, zoomLevel]
	)

	const handleTouchEnd = useCallback(() => {
		setIsDragging(false)
	}, [])

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
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="[&>button]:hidden max-w-4xl max-h-[90vh] p-0">
					<DialogHeader className="p-4 pb-2">
						<div className="flex items-center justify-between">
							<DialogTitle>
								{capitalize(heroData.name)} - {selectedCostumeData?.displayName}
							</DialogTitle>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleZoomOut}
									disabled={zoomLevel <= MAX_ZOOM_OUT}
								>
									<ZoomOut className="w-4 h-4" />
								</Button>
								<div className="text-sm font-medium min-w-[60px] text-center">
									{Math.round(zoomLevel * 100)}%
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={handleZoomIn}
									disabled={zoomLevel >= MAX_ZOOM_IN}
								>
									<ZoomIn className="w-4 h-4" />
								</Button>
								<Button variant="outline" size="sm" onClick={handleResetZoom}>
									<RotateCcw className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</DialogHeader>

					<div className="overflow-hidden flex-1 p-4 pt-2" ref={imageContainerRef}>
						<div
							className="flex justify-center items-center min-h-[400px] h-full"
							onMouseDown={handleMouseDown}
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}
							onMouseLeave={handleMouseUp}
							onTouchStart={handleTouchStart}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleTouchEnd}
							onWheel={handleWheel}
							style={{
								cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
							}}
						>
							{selectedCostumeData && (
								<div
									className="transition-transform duration-200 ease-out select-none"
									style={{
										transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${
											panPosition.y / zoomLevel
										}px)`,
										transformOrigin: "center center",
									}}
								>
									<Image
										src={`/assets/${selectedCostumeData.path}`}
										alt={`${heroData.name} - ${selectedCostume}`}
										width="0"
										height="0"
										sizes="100vw"
										className="w-auto h-full"
										priority
										draggable={false}
									/>
								</div>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
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
				sizes="20vw"
				className="w-full flex-1 hover:scale-110 transition-transform duration-300"
			/>
			<div className="text-sm font-bold w-full text-center absolute bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent text-white py-2 flex items-center justify-center">
				{costume.displayName}
			</div>
		</div>
	)
}
