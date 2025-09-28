import { HeroData } from "@/model/Hero"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface SkillsProps {
	heroData: HeroData
}

export default function Skills({ heroData }: SkillsProps) {
	return (
		<div className="space-y-4">
			{heroData.skills ? (
				Object.entries(heroData.skills).map(([skillKey, skill]) => (
					<Card key={skillKey}>
						<CardContent className="flex flex-row gap-4">
							{/* Skill Icon */}
							<div className="hidden md:block flex-shrink-0">
								<Image
									src={`/assets/${skill.thumbnail}`}
									alt={skill.name}
									width="0"
									height="0"
									sizes="10vw"
									className="w-full h-auto rounded mt-2"
								/>
							</div>

							{/* Skill Details */}
							<div className="flex-grow">
								<div className="flex flex-row md:items-center gap-2 mb-2">
									{/* Skill Icon */}
									<div className="flex md:hidden flex-shrink-0 justify-center items-center">
										<Image
											src={`/assets/${skill.thumbnail}`}
											alt={skill.name}
											width="0"
											height="0"
											sizes="10vw"
											className="w-10 h-10 rounded"
										/>
									</div>
									<div className="text-xl font-semibold flex items-center justify-center">
										{skill.name}
									</div>
									<div className="flex gap-2 text-sm items-center jusify-center">
										{skill.cost && (
											<Badge
												variant="default"
												className="bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900 h-fit"
											>
												Mana: {skill.cost}
											</Badge>
										)}
										{skill.cooldown && (
											<Badge
												variant="default"
												className="bg-orange-100 text-orange-800 dark:bg-orange-200 dark:text-orange-900 h-fit"
											>
												Cooldown: {skill.cooldown}s
											</Badge>
										)}
									</div>
								</div>
								<Separator className="mb-3" />
								<div>{skill.description}</div>

								{/* Skill Books if available */}
								{heroData.books && heroData.books[skillKey] && (
									<details className="mt-4 cursor-pointer">
										<summary className="font-medium text-sm mb-2 text-muted-foreground">
											Skill Books
										</summary>
										<div className="flex flex-col gap-2 text-xs">
											{Object.entries(heroData.books[skillKey]).map(([level, effect]) => (
												<div key={level} className="px-2 py-1 border-l-2">
													<div className="font-medium">
														{level}: {effect}
													</div>
												</div>
											))}
										</div>
									</details>
								)}
							</div>
						</CardContent>
					</Card>
				))
			) : (
				<div className="text-center text-gray-500 py-8">No skill data available</div>
			)}
		</div>
	)
}
