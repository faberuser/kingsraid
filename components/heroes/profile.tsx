import { useState } from "react"
import { HeroData } from "@/model/Hero"
import Image from "@/components/next-image"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ImageZoomModal from "@/components/image-modal"
import { ZoomIn } from "lucide-react"
import { capitalize, parseColoredText } from "@/lib/utils"

interface ProfileProps {
	heroData: HeroData
}

export default function Profile({ heroData }: ProfileProps) {
	const { profile } = heroData
	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleImageClick = () => {
		setIsModalOpen(true)
	}

	return (
		<div className="space-y-6">
			{/* Hero Info - Consolidated */}
			<Card>
				<CardContent>
					<div className="text-xl font-semibold pb-2">Hero Information</div>
					<Separator className="mb-6" />

					{/* Combat Stats Group */}
					<div className="mb-6">
						<h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
							Combat Attributes
						</h3>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Class</div>
									<div className="font-semibold">{profile.class}</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Position</div>
									<div className="font-semibold">{profile.position}</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Damage Type</div>
									<div className="font-semibold">{profile.damage_type}</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Attack Range</div>
									<div className="font-semibold">{profile.attack_range}</div>
								</div>
							</div>
						</div>
					</div>

					{/* Character Details Group */}
					<div>
						<h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
							Character Details
						</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Gender</div>
									<div className="font-semibold">{profile.gender}</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Race</div>
									<div className="font-semibold">{profile.race}</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Age</div>
									<div className="font-semibold">{profile.age}</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Height</div>
									<div className="font-semibold">{profile.height} cm</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Birthday</div>
									<div className="font-semibold">{profile.birth_of_month}</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Constellation</div>
									<div className="font-semibold">{profile.constellation}</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Likes</div>
									<div className="font-semibold">{profile.like}</div>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
								<div className="flex-1">
									<div className="text-xs text-muted-foreground mb-0.5">Dislikes</div>
									<div className="font-semibold">{profile.dislike}</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Personal Details */}
			<div className="grid lg:grid-cols-3 gap-6">
				{/* Story Section */}
				<Card className="lg:col-span-1">
					<CardContent>
						<div className="text-xl font-semibold pb-2">Background Story</div>
						<Separator className="mb-4" />
						<div className="prose max-w-none">
							<div>{parseColoredText(profile.story)}</div>
						</div>
					</CardContent>
				</Card>

				{/* Splash Art */}
				<Card className="lg:col-span-2">
					<CardContent>
						<div className="text-xl font-semibold pb-2">Splashart</div>
						<Separator className="mb-4" />
						<div
							className="relative w-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
							onClick={handleImageClick}
						>
							<Image
								src={`/kingsraid-data/assets/${heroData.splashart}`}
								alt={`${heroData.profile.name} Splashart`}
								width="0"
								height="0"
								sizes="80vw md:40vw"
								className="w-auto h-full rounded"
							/>
							<div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
								<ZoomIn className="w-12 h-12 text-white" />
							</div>
						</div>

						<ImageZoomModal
							isOpen={isModalOpen}
							onOpenChange={setIsModalOpen}
							imageSrc={`/kingsraid-data/assets/${heroData.splashart}`}
							imageAlt={`${heroData.profile.name} Splashart`}
							title={`${capitalize(heroData.profile.name)} Splashart`}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
