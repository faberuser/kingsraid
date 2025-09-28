import { HeroData } from "@/model/Hero"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { capitalize } from "@/lib/utils"

interface PerksProps {
	heroData: HeroData
}

export default function Perks({ heroData }: PerksProps) {
	return (
		<div className="space-y-6">
			{heroData.perks ? (
				Object.entries(heroData.perks).map(([perkCategory, perks]) => (
					<div key={perkCategory}>
						<div className="text-2xl font-bold capitalize mb-4">{perkCategory} Perks</div>

						<div className="space-y-4">
							{typeof perks === "object" &&
								Object.entries(perks).map(([perkKey, perk]) => (
									<Card key={perkKey}>
										<CardContent>
											{perkCategory === "t3" && (
												<div className="text-lg font-semibold mb-3">Skill {perkKey}</div>
											)}

											{typeof perk === "object" && "effect" in perk ? (
												/* T5 Perks */
												<div className="flex flex-col gap-3">
													{perk.thumbnail && (
														<div className="flex items-center gap-3">
															<Image
																src={`/assets/${perk.thumbnail}`}
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
														<div>{perk.effect}</div>
													</div>
												</div>
											) : (
												/* T3 Perks with Light/Dark options */
												<div className="grid md:grid-cols-2 gap-4">
													{"light" in perk && (
														<div className="border rounded p-3 bg-yellow-50 dark:bg-yellow-900/10">
															<div className="flex items-center gap-3 mb-2">
																<Image
																	src={`/assets/${perk.light.thumbnail}`}
																	alt="Light"
																	width="0"
																	height="0"
																	sizes="5vw"
																	className="w-10 h-10 rounded"
																/>
																<div className="font-medium text-yellow-800">Light</div>
															</div>
															<div className="text-sm">{perk.light.effect}</div>
														</div>
													)}

													{"dark" in perk && (
														<div className="border rounded p-3 bg-purple-50 dark:bg-purple-900/10">
															<div className="flex items-center gap-3 mb-2">
																<Image
																	src={`/assets/${perk.dark.thumbnail}`}
																	alt="Dark"
																	width="0"
																	height="0"
																	sizes="5vw"
																	className="w-10 h-10 rounded"
																/>
																<div className="font-medium text-purple-800">Dark</div>
															</div>
															<div className="text-sm">{perk.dark.effect}</div>
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
