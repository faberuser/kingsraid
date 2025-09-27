import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface ImageZoomModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	imageSrc: string
	imageAlt: string
	title?: string
	maxZoomIn?: number
	maxZoomOut?: number
}

const DEFAULT_MAX_ZOOM_IN = 10
const DEFAULT_MAX_ZOOM_OUT = 1

export default function ImageZoomModal({
	isOpen,
	onOpenChange,
	imageSrc,
	imageAlt,
	title,
	maxZoomIn = DEFAULT_MAX_ZOOM_IN,
	maxZoomOut = DEFAULT_MAX_ZOOM_OUT,
}: ImageZoomModalProps) {
	const [zoomLevel, setZoomLevel] = useState(1)
	const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
	const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 })

	const imageContainerRef = useRef<HTMLDivElement>(null)

	// Reset zoom and pan when modal opens
	const handleOpenChange = (open: boolean) => {
		if (open) {
			setZoomLevel(1)
			setPanPosition({ x: 0, y: 0 })
		}
		onOpenChange(open)
	}

	const handleZoomIn = () => {
		setZoomLevel((prev) => Math.min(prev + 0.25, maxZoomIn))
	}

	const handleZoomOut = () => {
		setZoomLevel((prev) => {
			const newZoom = Math.max(prev - 0.25, maxZoomOut)
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
	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			const zoomSpeed = 0.1
			const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed

			setZoomLevel((prev) => {
				const newZoom = Math.max(maxZoomOut, Math.min(maxZoomIn, prev + delta))
				if (newZoom === 1) {
					setPanPosition({ x: 0, y: 0 })
				}
				return newZoom
			})
		},
		[maxZoomIn, maxZoomOut]
	)

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

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="[&>button]:hidden max-w-[90vw] max-h-[90vh] p-0">
				<DialogHeader className="p-4 pb-2">
					<div className="flex items-center justify-between">
						{title && <DialogTitle>{title}</DialogTitle>}
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleZoomOut}
								disabled={zoomLevel <= maxZoomOut}
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
								disabled={zoomLevel >= maxZoomIn}
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
								src={imageSrc}
								alt={imageAlt}
								width="0"
								height="0"
								sizes="100vw"
								className="w-auto h-full"
								priority
								draggable={false}
							/>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
