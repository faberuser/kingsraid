"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "@/components/next-image"
import { BossData } from "@/model/Boss"

interface BossClientProps {
	bossData: BossData
}

export default function BossClient({ bossData }: BossClientProps) {
	const { infos, skills } = bossData

	return (
		<div>
			{/* Boss Header */}
			<div className="mb-8">
				<div className="flex items-start gap-6 mb-6">
					<div className="flex items-center justify-center self-stretch">
						<div className="w-30 h-30">
							<Image
								src={`/kingsraid-data/assets/${infos.thumbnail}`}
								alt={infos.name}
								width="0"
								height="0"
								sizes="10vw"
								className="w-full h-auto rounded"
							/>
						</div>
					</div>
					<div className="flex-1">
						<div className="text-3xl font-bold mb-2">{infos.name}</div>
						<div className="text-xl text-muted-foreground mb-4">{infos.title}</div>
						<div className="flex flex-wrap gap-2 mb-4">
							{bossData.infos.type.map((type) => (
								<Badge key={type} variant="default">
									{type}
								</Badge>
							))}
							<Badge variant="secondary">{infos.race}</Badge>
							<Badge
								variant="default"
								className={
									infos["damage type"] === "Physical"
										? "bg-red-300"
										: infos["damage type"] === "Magical"
										? "bg-blue-300"
										: "bg-yellow-400"
								}
							>
								{infos["damage type"]}
							</Badge>
						</div>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<Card className="gap-2">
						<CardHeader>
							<CardTitle>Characteristics</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm">{infos.characteristics}</div>
						</CardContent>
					</Card>

					<Card className="gap-2">
						<CardHeader>
							<CardTitle>Recommended Heroes</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-sm">{infos["recommended heroes"]}</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Skills Section */}
			<div className="mb-8">
				<div className="text-2xl font-bold mb-6">Skills</div>

				<div className="space-y-4">
					{Object.entries(skills).map(([skillId, skill]) => (
						<Card key={skillId} className="gap-2">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex flex-row gap-2 items-center">
										<CardTitle
											className={`text-lg ${
												infos["damage type"] === "Physical"
													? "text-red-300"
													: infos["damage type"] === "Magical"
													? "text-blue-300"
													: "text-yellow-400"
											}`}
										>
											{skill.name}
										</CardTitle>
										<div className="flex gap-2">
											{skill.cost && (
												<Badge
													variant="default"
													className="bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900"
												>
													Cost: {skill.cost}
												</Badge>
											)}
											{skill.cooldown && (
												<Badge
													variant="default"
													className="bg-orange-100 text-orange-800 dark:bg-orange-200 dark:text-orange-900"
												>
													Cooldown: {skill.cooldown}s
												</Badge>
											)}
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
