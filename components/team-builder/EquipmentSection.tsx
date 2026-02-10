"use client"

import Image from "@/components/next-image"
import { cn } from "@/lib/utils"
import { TeamMember } from "@/model/Team_Builder"
import { ArtifactData } from "@/model/Artifact"
import { MobileTooltip } from "@/components/mobile-tooltip"
import { ArtifactSelectDialog } from "@/components/team-builder/ArtifactSelectDialog"

interface EquipmentSectionProps {
	member: TeamMember
	index: number
	artifacts: ArtifactData[]
	artifactReleaseOrder: Record<string, string>
	toggleUW: (slot: number) => void
	selectUT: (slot: number, ut: string | null) => void
	selectArtifact: (slot: number, artifact: ArtifactData | null) => void
}

export function EquipmentSection({
	member,
	index,
	artifacts,
	artifactReleaseOrder,
	toggleUW,
	selectUT,
	selectArtifact,
}: EquipmentSectionProps) {
	if (!member.hero) return null

	return (
		<div>
			<div className="text-xs font-medium mb-2 text-muted-foreground">Equipment</div>
			<div className="flex gap-2 flex-wrap">
				{/* UW */}
				<MobileTooltip
					content={
						<>
							<div className="font-bold">{member.hero.uw?.name}</div>
							<div className="text-xs mt-1">{member.hero.uw?.description}</div>
						</>
					}
				>
					<button
						onClick={() => toggleUW(index)}
						className={cn(
							"w-10 h-10 rounded border-2 overflow-hidden transition-all",
							member.uw
								? "border-yellow-500 ring-2 ring-yellow-500/30"
								: "border-muted opacity-50 hover:opacity-100",
						)}
					>
						{member.hero.uw?.thumbnail && (
							<Image
								src={`/kingsraid-data/assets/${member.hero.uw.thumbnail}`}
								alt="UW"
								width={40}
								height={40}
								className={cn("w-full h-full object-cover transition-all", !member.uw && "grayscale")}
							/>
						)}
					</button>
				</MobileTooltip>

				{/* UTs */}
				{Object.entries(member.hero.uts || {}).map(([utKey, ut]) => (
					<MobileTooltip
						key={utKey}
						content={
							<>
								<div className="font-bold">
									Skill {utKey}: {ut.name}
								</div>
								<div className="text-xs mt-1">{ut.description}</div>
							</>
						}
					>
						<button
							onClick={() => selectUT(index, utKey)}
							className={cn(
								"w-10 h-10 rounded border-2 overflow-hidden transition-all",
								member.ut === utKey
									? "border-purple-500 ring-2 ring-purple-500/30"
									: "border-muted opacity-50 hover:opacity-100",
							)}
						>
							<Image
								src={`/kingsraid-data/assets/${ut.thumbnail}`}
								alt={`UT${utKey}`}
								width={40}
								height={40}
								className={cn(
									"w-full h-full object-cover transition-all",
									member.ut !== utKey && "grayscale",
								)}
							/>
						</button>
					</MobileTooltip>
				))}

				{/* Artifact */}
				<ArtifactSelectDialog
					artifacts={artifacts}
					artifactReleaseOrder={artifactReleaseOrder}
					selectedArtifact={member.artifact}
					onSelect={(artifact) => selectArtifact(index, artifact)}
				/>
			</div>
		</div>
	)
}
