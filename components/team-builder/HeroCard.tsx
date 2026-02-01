"use client"

import Image from "@/components/next-image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { TeamMember } from "@/app/team-builder/types"
import { calculateUsedPoints } from "@/app/team-builder/utils"
import { EquipmentSection } from "./EquipmentSection"
import { PerksDialog } from "./PerksDialog"

interface HeroCardProps {
	member: TeamMember
	index: number
	perksDialogOpen: boolean
	selectedSlot: number | null
	onRemove: (slot: number) => void
	onToggleUW: (slot: number) => void
	onSelectUT: (slot: number, ut: string | null) => void
	onPerksDialogChange: (open: boolean, slot: number) => void
	onPerkToggle: (slot: number, tier: "t1" | "t2" | "t3" | "t5", perkId: string, subType?: "light" | "dark") => void
	onMaxPointsUpdate: (slot: number, points: number) => void
	t1Perks: Record<string, string>
	getT2Perks: (heroClass: string) => Record<string, string>
	// Drag and drop props
	isDragging?: boolean
	isDragOver?: boolean
	onDragStart?: (index: number) => void
	onDragOver?: (e: React.DragEvent, index: number) => void
	onDragLeave?: () => void
	onDrop?: (index: number) => void
	onDragEnd?: () => void
}

export function HeroCard({
	member,
	index,
	perksDialogOpen,
	selectedSlot,
	onRemove,
	onToggleUW,
	onSelectUT,
	onPerksDialogChange,
	onPerkToggle,
	onMaxPointsUpdate,
	t1Perks,
	getT2Perks,
	isDragging,
	isDragOver,
	onDragStart,
	onDragOver,
	onDragLeave,
	onDrop,
	onDragEnd,
}: HeroCardProps) {
	if (!member.hero) return null

	return (
		<Card
			className={cn(
				"relative transition-all ring-1 ring-primary/20 gap-2",
				isDragging && "opacity-50 scale-95",
				isDragOver && "ring-2 ring-primary bg-primary/5",
				onDragStart && "cursor-grab active:cursor-grabbing",
			)}
			draggable={!!onDragStart}
			onDragStart={() => onDragStart?.(index)}
			onDragOver={(e) => onDragOver?.(e, index)}
			onDragLeave={onDragLeave}
			onDrop={() => onDrop?.(index)}
			onDragEnd={onDragEnd}
		>
			{/* Hero Card with Content */}
			<CardHeader>
				<div className="flex justify-between">
					<div className="flex items-center gap-4">
						<div className="relative">
							<Image
								src={`/kingsraid-data/assets/${member.hero.profile.thumbnail}`}
								alt={member.hero.profile.name}
								width={60}
								height={60}
								className="rounded border"
							/>
							<div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border overflow-hidden">
								<Image
									src={`/kingsraid-data/assets/classes/${member.hero.profile.class.toLowerCase()}.png`}
									alt={member.hero.profile.class}
									width={20}
									height={20}
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
						<div className="flex-1 min-w-0">
							<CardTitle className="text-base truncate">{member.hero.profile.name}</CardTitle>
							<Badge
								variant="default"
								className={
									member.hero.profile.damage_type === "Physical" ? "bg-red-300" : "bg-blue-300"
								}
							>
								{member.hero.profile.damage_type}
							</Badge>
						</div>
					</div>

					<div className="flex gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6"
									asChild
									onClick={(e) => e.stopPropagation()}
								>
									<Link
										href={`/heroes/${encodeURIComponent(member.hero.profile.name.toLowerCase().replace(/\s+/g, "-"))}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<ExternalLink className="h-4 w-4" />
									</Link>
								</Button>
							</TooltipTrigger>
							<TooltipContent>View Hero Details</TooltipContent>
						</Tooltip>
						<Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(index)}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-2">
				{/* Equipment Section */}
				<EquipmentSection member={member} index={index} toggleUW={onToggleUW} selectUT={onSelectUT} />

				{/* Perks Section */}
				<div className="space-y-2 mb-4">
					<div className="flex justify-between items-center">
						<div className="text-xs font-medium text-muted-foreground">Perks</div>
						<div className="text-xs">
							<span
								className={cn(
									"font-medium",
									calculateUsedPoints(member.perks) > member.maxPoints
										? "text-red-500"
										: "text-green-500",
								)}
							>
								{calculateUsedPoints(member.perks)}
							</span>
							<span className="text-muted-foreground">/{member.maxPoints}</span>
						</div>
					</div>

					{/* Points Progress Bar */}
					<div className="h-1.5 bg-muted rounded-full overflow-hidden">
						<div
							className={cn(
								"h-full transition-all duration-300 rounded-full",
								calculateUsedPoints(member.perks) > member.maxPoints
									? "bg-red-500"
									: calculateUsedPoints(member.perks) === member.maxPoints
										? "bg-green-500"
										: "bg-primary",
							)}
							style={{
								width: `${Math.min(100, (calculateUsedPoints(member.perks) / member.maxPoints) * 100)}%`,
							}}
						/>
					</div>
				</div>

				{/* Edit Perks Dialog */}
				<PerksDialog
					member={member}
					index={index}
					isOpen={perksDialogOpen && selectedSlot === index}
					onOpenChange={(open) => onPerksDialogChange(open, index)}
					onPerkToggle={onPerkToggle}
					onMaxPointsUpdate={onMaxPointsUpdate}
					t1Perks={t1Perks}
					getT2Perks={getT2Perks}
				/>
			</CardContent>
		</Card>
	)
}
