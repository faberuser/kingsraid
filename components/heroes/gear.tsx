import { Hero } from "@/model/Hero"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { classColorMapText, classColorMapBg } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
interface GearProps {
	heroData: Hero
}

export default function Gear({ heroData }: GearProps) {
	return (
		<div className="space-y-6">
			{/* Unique Weapon */}
			{heroData.uw && (
				<Card>
					<CardContent>
						<div className="flex items-center gap-2 mb-4">
							<div className="text-2xl font-bold">Unique Weapon</div>
						</div>

						<div className="flex flex-col md:flex-row gap-6">
							<div className="flex-shrink-0">
								<Image
									src={`/assets/${heroData.uw.thumbnail}`}
									alt={heroData.uw.name}
									width={80}
									height={80}
									className="rounded"
								/>
							</div>

							<div className="flex-grow">
								<div
									className={`text-xl font-semibold mb-2 ${classColorMapText(heroData.infos.class)}`}
								>
									{heroData.uw.name}
								</div>
								<Separator className="mb-3" />
								<div className="mb-4">{heroData.uw.description}</div>

								{/* UW Values */}
								{heroData.uw.value && (
									<div className="mb-4">
										<div className="font-medium text-sm text-muted-foreground mb-2">
											Enhancement Values
										</div>
										<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-2 text-xs">
											{Object.entries(heroData.uw.value).map(([statKey, statValues]) => (
												<div key={statKey} className="space-y-1">
													<div
														className={`font-medium ${classColorMapText(
															heroData.infos.class
														)}`}
													>
														Stat {statKey}
													</div>
													{Object.entries(statValues).map(([level, value]) => (
														<div
															key={level}
															className={`px-2 py-1 rounded text-center ${classColorMapBg(
																heroData.infos.class
															)}`}
														>
															{level}*: {value}
														</div>
													))}
												</div>
											))}
										</div>
									</div>
								)}

								{/* UW Story */}
								<details className="cursor-pointer">
									<summary className="font-medium text-sm text-muted-foreground hover:text-gray-800 dark:hover:text-gray-200">
										Weapon Story
									</summary>
									<div className="mt-2 p-3 bg-gray-50 rounded text-sm dark:bg-gray-900/10">
										{heroData.uw.story}
									</div>
								</details>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Unique Treasures */}
			{heroData.uts && (
				<Card>
					<CardContent>
						<div className="flex items-center gap-2 mb-4">
							<div className="text-2xl font-bold">Unique Treasures</div>
						</div>

						<div className="grid gap-4">
							{Object.entries(heroData.uts).map(([utKey, ut]) => (
								<div key={utKey} className="border rounded-lg p-4">
									<div className="flex flex-col md:flex-row gap-4">
										<div className="flex-shrink-0">
											<Image
												src={`/assets/${ut.thumbnail}`}
												alt={ut.name}
												width={64}
												height={64}
												className="rounded"
											/>
										</div>

										<div className="flex-grow">
											<div
												className={`text-lg font-semibold mb-2 ${classColorMapText(
													heroData.infos.class
												)}`}
											>
												{ut.name}
											</div>
											<div className="mb-3">{ut.description}</div>

											{/* UT Values */}
											{ut.value && (
												<div className="mb-3">
													<div className="font-medium text-xs text-muted-foreground mb-2">
														Enhancement Values
													</div>
													<div className="flex gap-2 text-xs">
														{Object.entries(ut.value).map(([statKey, statValues]) => (
															<div key={statKey} className="flex gap-1">
																{Object.entries(statValues).map(([level, value]) => (
																	<div
																		key={level}
																		className={`px-2 py-1 rounded text-center ${classColorMapBg(
																			heroData.infos.class
																		)}`}
																	>
																		{level}*: {value}
																	</div>
																))}
															</div>
														))}
													</div>
												</div>
											)}

											{/* UT Story */}
											<details className="cursor-pointer">
												<summary className="font-medium text-sm text-muted-foreground hover:text-gray-800 dark:hover:text-gray-200">
													Treasure Story
												</summary>
												<div className="mt-2 p-3 bg-gray-50 rounded text-sm dark:bg-gray-900/10">
													{ut.story}
												</div>
											</details>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Soul Weapon */}
			{heroData.sw && (
				<Card>
					<CardContent>
						<div className="flex items-center gap-2 mb-4">
							<div className="text-2xl font-bold">Soul Weapon</div>
						</div>

						<div className="flex flex-col md:flex-row gap-6">
							<div className="flex-shrink-0">
								<Image
									src={`/assets/${heroData.sw.thumbnail}`}
									alt="Soul Weapon"
									width={80}
									height={80}
									className="rounded"
								/>
							</div>

							<div className="flex-grow">
								<div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
									<div className={`text-xl font-semibold ${classColorMapText(heroData.infos.class)}`}>
										{heroData.uw.name}
									</div>
									<div className="flex gap-2 text-sm">
										<Badge
											variant="default"
											className="bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900"
										>
											Uses: {heroData.sw.uses}
										</Badge>
										<Badge
											variant="default"
											className="bg-orange-100 text-orange-800 dark:bg-orange-200 dark:text-orange-900"
										>
											CD: {heroData.sw.cooldown}s
										</Badge>
									</div>
								</div>

								<Separator className="mb-3" />

								<div className="space-y-3">
									<div>
										<h4 className="font-medium">Requirement</h4>
										<div>{heroData.sw.requirement}</div>
									</div>

									<div>
										<div className="font-medium ">Effect</div>
										<div>{heroData.sw.description}</div>
									</div>

									{/* SW Advancement */}
									{heroData.sw.advancement && (
										<div>
											<div className="font-medium text-sm text-muted-foreground mb-2">
												Advancements
											</div>
											<div className="space-y-2">
												{Object.entries(heroData.sw.advancement).map(([level, effect]) => (
													<div
														key={level}
														className={`px-3 py-2 rounded ${classColorMapBg(
															heroData.infos.class
														)}`}
													>
														<div
															className={`font-medium ${classColorMapText(
																heroData.infos.class
															)}`}
														>
															Stage {level}
														</div>
														<div>{effect}</div>
													</div>
												))}
											</div>
										</div>
									)}

									{/* SW Story */}
									<details className="cursor-pointer">
										<summary className="font-medium text-sm text-muted-foreground hover:text-gray-800 dark:hover:text-gray-200">
											Soul Weapon Story
										</summary>
										<div className="mt-2 p-3 bg-gray-50 rounded text-sm dark:bg-gray-900/10">
											{heroData.sw.story}
										</div>
									</details>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{!heroData.uw && !heroData.uts && !heroData.sw && (
				<div className="text-center text-gray-500 py-8">No gear data available</div>
			)}
		</div>
	)
}
