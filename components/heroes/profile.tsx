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
						<div className="text-xl font-semibold pb-2">Splashart</div>
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
