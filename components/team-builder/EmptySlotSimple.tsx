"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptySlotProps {
	index: number
	onOpenDialog: (slot: number) => void
	// Drag and drop props
	isDragOver?: boolean
	onDragOver?: (e: React.DragEvent, index: number) => void
	onDragLeave?: () => void
	onDrop?: (index: number) => void
}

export function EmptySlot({ index, onOpenDialog, isDragOver, onDragOver, onDragLeave, onDrop }: EmptySlotProps) {
	return (
		<Card
			className={cn(
				"relative transition-all border-dashed",
				isDragOver && "ring-2 ring-primary bg-primary/5 border-solid",
			)}
			onDragOver={(e) => onDragOver?.(e, index)}
			onDragLeave={onDragLeave}
			onDrop={() => onDrop?.(index)}
		>
			<CardContent className="flex flex-col items-center justify-center h-48 p-6">
				<Button
					variant="outline"
					className="h-24 w-24 rounded-full border-dashed border-2"
					onClick={() => onOpenDialog(index)}
				>
					<Plus className="h-8 w-8" />
				</Button>
				<p className="text-sm text-muted-foreground mt-3">Add Hero</p>
				<p className="text-xs text-muted-foreground">Slot {index + 1}</p>
			</CardContent>
		</Card>
	)
}
