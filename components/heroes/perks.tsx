"use client"

import { HeroData } from "@/model/Hero"
import { Card, CardContent } from "@/components/ui/card"
import Image from "@/components/next-image"
import { capitalize, parseColoredText } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

export interface ClassPerksData {
	t1Perks: Record<string, string>
	t2Perks: Record<string, Record<string, string>>
}

interface PerksProps {
	heroData: HeroData
	classPerks: ClassPerksData
}

export default function Perks({ heroData, classPerks }: PerksProps) {
	const [t1Open, setT1Open] = useState(false)
	const [t2Open, setT2Open] = useState(false)

	const heroClass = heroData.profile.class.toLowerCase()
	const t1Perks = classPerks.t1Perks || {}
	const t2Perks = classPerks.t2Perks[heroClass] || {}

	return (
		<div className="space-y-4">
			{/* T1 Perks */}
			<Collapsible open={t1Open} onOpenChange={setT1Open}>
				<CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-bold mb-2 hover:opacity-80 transition-opacity">
					<span>T1 Perks</span>
					<ChevronDown
						className={`h-6 w-6 transition-transform duration-200 ${t1Open ? "rotate-180" : ""}`}
					/>
				</CollapsibleTrigger>
				<CollapsibleContent className="space-y-4">
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Object.entries(t1Perks).map(([perkName, effect]) => (
							<Card key={perkName}>
								<CardContent>
									<div className="flex items-center gap-3 mb-2">
										<Image
											src={`/kingsraid-data/assets/perks/t1/${perkName}.png`}
											alt={perkName}
											width="0"
											height="0"
											sizes="5vw"
											className="w-10 h-10 rounded"
										/>
										<div className="font-medium">{perkName}</div>
									</div>
									<div className="text-sm text-muted-foreground">{effect}</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CollapsibleContent>
			</Collapsible>

			{/* T2 Perks */}
			<Collapsible open={t2Open} onOpenChange={setT2Open}>
				<CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-bold mb-2 hover:opacity-80 transition-opacity">
					<span>T2 Perks</span>
					<ChevronDown
						className={`h-6 w-6 transition-transform duration-200 ${t2Open ? "rotate-180" : ""}`}
					/>
				</CollapsibleTrigger>
				<CollapsibleContent className="space-y-4">
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Object.entries(t2Perks).map(([perkName, effect]) => (
							<Card key={perkName}>
								<CardContent>
									<div className="flex items-center gap-3 mb-2">
										<Image
											src={`/kingsraid-data/assets/perks/t2/${heroClass}/${perkName}.png`}
											alt={perkName}
											width="0"
											height="0"
											sizes="5vw"
											className="w-10 h-10 rounded"
										/>
										<div className="font-medium">{perkName}</div>
									</div>
									<div className="text-sm text-muted-foreground">{effect}</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CollapsibleContent>
			</Collapsible>

			{/* Hero-specific perks (T3, T5) */}
			{heroData.perks ? (
				Object.entries(heroData.perks).map(([perkCategory, perks]) => (
					<div key={perkCategory}>
						<div className="text-lg font-bold capitalize mb-2">{perkCategory} Perks</div>

						<div className="space-y-4">
							{typeof perks === "object" &&
								Object.entries(perks).map(([perkKey, perk]) => (
									<Card key={perkKey} className="p-4 pt-3">
										<CardContent className="px-0">
											{perkCategory === "t3" && (
												<div className="text-lg font-semibold mb-3">Skill {perkKey}</div>
											)}

											{typeof perk === "object" && "effect" in perk ? (
												/* T5 Perks */
												<div className="flex flex-col gap-3">
													{perk.thumbnail && (
														<div className="flex items-center gap-3">
															<Image
																src={`/kingsraid-data/assets/${perk.thumbnail}`}
																alt={perkKey}
																width="0"
																height="0"
																sizes="5vw"
																className="w-10 h-10 rounded border self-start"
															/>
															<div
																className={`font-medium ${
																	perkKey === "light"
																		? "text-yellow-800"
																		: "text-purple-800"
																}`}
															>
																{capitalize(perkKey)}
															</div>
														</div>
													)}
													<div className="flex-grow flex items-center">
														<div>{parseColoredText(perk.effect)}</div>
													</div>
												</div>
											) : (
												/* T3 Perks with Light/Dark options */
												<div className="grid md:grid-cols-2 gap-4">
													{"light" in perk && (
														<div className="border rounded p-3 bg-yellow-50 dark:bg-yellow-900/10">
															<div className="flex items-center gap-3 mb-2">
																<Image
																	src={`/kingsraid-data/assets/${perk.light.thumbnail}`}
																	alt="Light"
																	width="0"
																	height="0"
																	sizes="5vw"
																	className="w-10 h-10 rounded"
																/>
																<div className="font-medium text-yellow-800">Light</div>
															</div>
															<div className="text-sm">
																{parseColoredText(perk.light.effect)}
															</div>
														</div>
													)}

													{"dark" in perk && (
														<div className="border rounded p-3 bg-purple-50 dark:bg-purple-900/10">
															<div className="flex items-center gap-3 mb-2">
																<Image
																	src={`/kingsraid-data/assets/${perk.dark.thumbnail}`}
																	alt="Dark"
																	width="0"
																	height="0"
																	sizes="5vw"
																	className="w-10 h-10 rounded"
																/>
																<div className="font-medium text-purple-800">Dark</div>
															</div>
															<div className="text-sm">
																{parseColoredText(perk.dark.effect)}
															</div>
														</div>
													)}
												</div>
											)}
										</CardContent>
									</Card>
								))}
						</div>
					</div>
				))
			) : (
				<div className="text-center text-gray-500 py-8">No perk data available</div>
			)}
		</div>
	)
}
