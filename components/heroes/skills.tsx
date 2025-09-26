import { Hero } from "@/model/Hero"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface SkillsProps {
	heroData: Hero
}

export default function Skills({ heroData }: SkillsProps) {
	return (
		<div className="space-y-4">
			{heroData.skills ? (
				Object.entries(heroData.skills).map(([skillKey, skill]) => (
					<Card key={skillKey}>
						<CardContent className="flex flex-col md:flex-row gap-4">
							{/* Skill Icon */}
							<div className="flex-shrink-0">
								<Image
									src={`/assets/${skill.thumbnail}`}
									alt={skill.name}
									width={64}
									height={64}
									className="rounded"
								/>
							</div>

							{/* Skill Details */}
							<div className="flex-grow">
								<div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
									<div className="text-xl font-semibold">{skill.name}</div>
									<div className="flex gap-2 text-sm">
										{skill.cost && (
											<div className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900">
												Mana: {skill.cost}
											</div>
										)}
										{skill.cooldown && (
											<div className="px-2 py-1 rounded bg-orange-100 text-orange-800 dark:bg-orange-200 dark:text-orange-900">
												CD: {skill.cooldown}s
											</div>
										)}
									</div>
								</div>
								<Separator className="mb-3" />
								<div>{skill.description}</div>

								{/* Skill Books if available */}
								{heroData.books && heroData.books[skillKey] && (
									<div className="mt-4">
										<div className="font-medium text-sm mb-2 text-muted-foreground">
											Skill Books
										</div>
										<div className="flex flex-col gap-2 text-xs">
											{Object.entries(heroData.books[skillKey]).map(([level, effect]) => (
												<div key={level} className="px-2 py-1 border-l-2">
													<div className="font-medium">{level}:</div> {effect}
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				))
			) : (
				<p className="text-center text-gray-500 py-8">No skill data available</p>
			)}
		</div>
	)
}
