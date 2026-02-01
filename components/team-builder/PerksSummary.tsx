"use client"

import Image from "@/components/next-image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { TeamMember } from "@/app/team-builder/types"

interface PerksSummaryProps {
	member: TeamMember
	t1Perks: Record<string, string>
	getT2Perks: (heroClass: string) => Record<string, string>
}

export function PerksSummary({ member, t1Perks, getT2Perks }: PerksSummaryProps) {
	if (!member.hero) return null

	return (
		<div className="flex flex-wrap gap-0.5 mb-2 min-h-[24px]">
			{/* T1 Perks */}
			{member.perks.t1.map((perkName) => {
				const effect = t1Perks[perkName] || ""
				return (
					<Tooltip key={perkName}>
						<TooltipTrigger asChild>
							<div className="w-6 h-6 rounded border border-blue-500/50 overflow-hidden bg-muted">
								<Image
									src={`/kingsraid-data/assets/perks/t1/${perkName}.png`}
									alt={perkName}
									width={24}
									height={24}
									className="w-full h-full object-cover"
								/>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p className="font-medium">{perkName}</p>
							<p className="text-xs">{effect}</p>
						</TooltipContent>
					</Tooltip>
				)
			})}

			{/* T2 Perks */}
			{member.perks.t2.map((perkName) => {
				const heroClass = member.hero!.profile.class?.toLowerCase()
				const t2Perks = heroClass ? getT2Perks(heroClass) : {}
				const effect = t2Perks[perkName] || ""
				return (
					<Tooltip key={perkName}>
						<TooltipTrigger asChild>
							<div className="w-6 h-6 rounded border border-green-500/50 overflow-hidden bg-muted">
								{heroClass && (
									<Image
										src={`/kingsraid-data/assets/perks/t2/${heroClass}/${perkName}.png`}
										alt={perkName}
										width={24}
										height={24}
										className="w-full h-full object-cover"
									/>
								)}
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p className="font-medium">{perkName}</p>
							<p className="text-xs">{effect}</p>
						</TooltipContent>
					</Tooltip>
				)
			})}

			{/* T3 Perks */}
			{member.perks.t3.map((p) => (
				<Tooltip key={`${p.skill}-${p.type}`}>
					<TooltipTrigger asChild>
						<div
							className={cn(
								"w-6 h-6 rounded border overflow-hidden flex items-center justify-center text-[10px] font-bold",
								p.type === "light"
									? "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
									: "border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400",
							)}
						>
							{p.skill}
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p className="font-medium">
							Skill {p.skill} {p.type === "light" ? "Light" : "Dark"}
						</p>
					</TooltipContent>
				</Tooltip>
			))}

			{/* T5 Perks */}
			{member.perks.t5.map((p) => (
				<Tooltip key={p}>
					<TooltipTrigger asChild>
						<div
							className={cn(
								"w-6 h-6 rounded border overflow-hidden flex items-center justify-center text-[9px] font-bold",
								p === "light"
									? "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
									: "border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400",
							)}
						>
							T5
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p className="font-medium">T5 {p === "light" ? "Light" : "Dark"}</p>
					</TooltipContent>
				</Tooltip>
			))}

			{/* Empty state */}
			{member.perks.t1.length === 0 &&
				member.perks.t2.length === 0 &&
				member.perks.t3.length === 0 &&
				member.perks.t5.length === 0 && (
					<span className="text-xs text-muted-foreground">No perks selected</span>
				)}
		</div>
	)
}
