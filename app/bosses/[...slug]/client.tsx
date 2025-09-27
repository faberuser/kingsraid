"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { BossData } from "@/model/Boss"

interface BossClientProps {
	bossData: BossData
}

export default function BossClient({ bossData }: BossClientProps) {
	const { infos, skills } = bossData

	return (
		<div className="container mx-auto p-2 sm:p-8">
			{/* Back Button */}
			<div className="mb-6">
				<Link href="/bosses">
					<Button variant="ghost" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to Bosses
					</Button>
				</Link>
			</div>

			{/* Boss Header */}
			<div className="mb-8">
				<div className="flex items-start gap-6 mb-6">
					<div className="flex items-center justify-center self-stretch">
						<div className="w-30 h-30">
							<Image
								src={`/assets/${infos.thumbnail}`}
								alt={infos.class}
								width="0"
								height="0"
								sizes="100vw"
								className="w-full h-auto rounded object-cover"
							/>
						</div>
					</div>
					<div className="flex-1">
						<div className="text-4xl font-bold mb-2">{infos.class}</div>
						<div className="text-xl text-muted-foreground mb-4">{infos.title}</div>
						<div className="flex flex-wrap gap-2 mb-4">
							<Badge variant="secondary">{infos.race}</Badge>
							<Badge
								variant="default"
								className={infos["damage type"] === "Physical" ? "bg-red-300" : "bg-blue-300"}
							>
								{infos["damage type"]}
							</Badge>
						</div>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Characteristics</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm">{infos.characteristics}</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recommended Heroes</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm">{infos["recommended heroes"]}</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Separator className="mb-8" />

			{/* Skills Section */}
			<div className="mb-8">
				<div className="text-2xl font-bold mb-6">Skills</div>

				<div className="space-y-4">
					{Object.entries(skills).map(([skillId, skill]) => (
						<Card key={skillId}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div>
										<CardTitle className="text-lg">{skill.name}</CardTitle>
										<div className="flex gap-4 mt-2">
											{skill.cost && <Badge variant="outline">Cost: {skill.cost}</Badge>}
											{skill.cooldown && <Badge variant="outline">CD: {skill.cooldown}s</Badge>}
										</div>
									</div>
									<Badge variant="secondary">#{skillId}</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-sm">{skill.description}</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	)
}
