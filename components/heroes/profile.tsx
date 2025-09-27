import { Hero } from "@/model/Hero"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { capitalize, classColorMapText } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface ProfileProps {
	heroData: Hero
}

export default function Profile({ heroData }: ProfileProps) {
	const { infos } = heroData

	return (
		<div className="space-y-6">
			{/* Hero Basic Info */}
			<Card>
				<CardContent className="flex flex-col md:flex-row items-center md:items-start gap-6">
					{/* Hero Image */}
					<div className="flex items-center justify-center self-stretch">
						<div className="w-32 h-32 md:w-40 md:h-40">
							<Image
								src={`/assets/${infos.thumbnail}`}
								alt={heroData.name}
								width="0"
								height="0"
								sizes="100vw"
								className="w-full h-auto rounded object-cover"
							/>
						</div>
					</div>

					{/* Hero Basic Info */}
					<div className="flex-grow">
						<div className="mb-2 text-center sm:text-start">
							<div className="text-3xl font-bold">{capitalize(heroData.name)}</div>
							<div className={`text-lg font-semibold ${classColorMapText(infos.class)}`}>
								{infos.title}
							</div>
						</div>

						<Separator className="mb-4" />

						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
							<div className="px-3 py-1 rounded border-l-4 border-blue-500">
								<div className="font-semibold">Class</div>
								<div>{infos.class}</div>
							</div>
							<div className="px-3 py-1 rounded border-l-4 border-green-500">
								<div className="font-semibold">Position</div>
								<div>{infos.position}</div>
							</div>
							<div className="px-3 py-1 rounded border-l-4 border-red-500">
								<div className="font-semibold">Damage Type</div>
								<div>{infos["damage type"]}</div>
							</div>
							<div className="px-3 py-1 rounded border-l-4 border-yellow-500">
								<div className="font-semibold">Attack Range</div>
								<div>{infos["attack range"]}</div>
							</div>
							<div className="px-3 py-1 rounded border-l-4 border-pink-500">
								<div className="font-semibold">Gender</div>
								<div>{infos.gender}</div>
							</div>
							<div className="px-3 py-1 rounded border-l-4 border-indigo-500">
								<div className="font-semibold">Race</div>
								<div>{infos.race}</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Personal Details */}
			<div className="grid md:grid-cols-2 gap-6">
				<Card>
					<CardContent>
						<div className="text-xl font-semibold pb-2">Personal Details</div>
						<Separator className="mb-4" />
						<div className="space-y-3">
							<div className="flex justify-between py-2">
								<div className="font-medium ">Age</div>
								<div>{infos.age}</div>
							</div>
							<Separator />
							<div className="flex justify-between py-2">
								<div className="font-medium ">Height</div>
								<div>{infos.height} cm</div>
							</div>
							<Separator />
							<div className="flex justify-between py-2">
								<div className="font-medium ">Birthday</div>
								<div>{infos["birth of month"]}</div>
							</div>
							<Separator />
							<div className="flex justify-between py-2">
								<div className="font-medium ">Constellation</div>
								<div>{infos.constellation}</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent>
						<div className="text-xl font-semibold pb-2">Preferences</div>
						<Separator className="mb-4" />
						<div className="space-y-4">
							<div>
								<div className="font-medium text-green-600 text-sm">LIKES</div>
								<div className="mt-1 p-3 rounded border-l-4 border-green-400">{infos.like}</div>
							</div>
							<div>
								<div className="font-medium text-red-600 text-sm">DISLIKES</div>
								<div className="mt-1 p-3 rounded border-l-4 border-red-400">{infos.dislike}</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				{/* Story Section */}
				<Card>
					<CardContent>
						<div className="text-xl font-semibold pb-2">Background Story</div>
						<Separator className="mb-4" />
						<div className="prose max-w-none">
							<div className="text-justify">{infos.story}</div>
						</div>
					</CardContent>
				</Card>

				{/* Splash Art */}
				<Card>
					<CardContent>
						<h3 className="text-xl font-semibold pb-2">Splashart</h3>
						<Separator className="mb-4" />
						<div className="w-full flex items-center justify-center">
							<Image
								src={`/assets/${heroData.splashart}`}
								alt={`${heroData.name} Splashart`}
								width="0"
								height="0"
								sizes="100vw"
								className="w-auto h-full rounded"
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
