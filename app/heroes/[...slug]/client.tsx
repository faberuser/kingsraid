"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { HeroData } from "@/model/Hero"
import Profile from "@/components/heroes/profile"
import Skills from "@/components/heroes/skills"
import Perks from "@/components/heroes/perks"
import Gear from "@/components/heroes/gear"
import Costumes from "@/components/heroes/costumes"
import Models from "@/components/heroes/models"
import Voices, { VoiceFiles } from "@/components/heroes/voices"
import { capitalize, classColorMapBadge } from "@/lib/utils"
import Image from "@/components/next-image"
import { Costume, ModelFile } from "@/model/Hero_Model"
import DataHeavyContent from "@/components/data-heavy-content"
import { ClassPerksData } from "@/components/heroes/perks"

interface HeroClientProps {
	heroData: HeroData
	costumes: Costume[]
	heroModels: { [costume: string]: ModelFile[] }
	voiceFiles: VoiceFiles
	availableScenes?: Array<{ value: string; label: string }>
	enableModelsVoices?: boolean
	classPerks: ClassPerksData
}

export default function HeroClient({
	heroData,
	costumes,
	heroModels,
	voiceFiles,
	availableScenes = [],
	enableModelsVoices = false,
	classPerks,
}: HeroClientProps) {
	return (
		<div>
			{/* Compact Hero Header */}
			<div className="flex flex-row gap-4 items-center pb-2">
				{/* Hero Image - Smaller */}
				<div className="shrink-0 relative">
					<div className="w-16 h-16 md:w-20 md:h-20">
						<Image
							src={`/kingsraid-data/assets/${heroData.profile.thumbnail}`}
							alt={heroData.profile.name}
							width="0"
							height="0"
							sizes="20vw md:5vw"
							className="w-full h-auto rounded"
						/>
					</div>
					{/* Class Icon Badge */}
					<div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full bg-background border-2 overflow-hidden shadow-sm">
						<Image
							src={`/kingsraid-data/assets/classes/${heroData.profile.class.toLowerCase()}.png`}
							alt={heroData.profile.class}
							width={28}
							height={28}
							className="w-full h-full object-cover"
						/>
					</div>
				</div>

				{/* Hero Name & Key Stats */}
				<div className="flex-grow min-w-0">
					<div className="flex flex-col">
						<h1 className="text-2xl md:text-3xl font-bold truncate">{capitalize(heroData.profile.name)}</h1>
						<span className="text-sm md:text-base text-muted-foreground">{heroData.profile.title}</span>
					</div>
					<div className="flex flex-wrap gap-2 mt-2">
						<Badge variant="default" className={classColorMapBadge(heroData.profile.class)}>
							{heroData.profile.class}
						</Badge>
						<Badge variant="secondary">{heroData.profile.position}</Badge>
						<Badge
							variant="default"
							className={heroData.profile.damage_type === "Physical" ? "bg-red-300" : "bg-blue-300"}
						>
							{heroData.profile.damage_type}
						</Badge>
					</div>
				</div>
			</div>

			<Tabs defaultValue="skills" className="w-full mt-2">
				<TabsList className="w-full overflow-x-auto overflow-y-hidden flex-nowrap justify-start">
					<TabsTrigger value="skills">Skills</TabsTrigger>
					<TabsTrigger value="perks">Perks</TabsTrigger>
					<TabsTrigger value="gear">Gear</TabsTrigger>
					<TabsTrigger value="profile">Profile</TabsTrigger>
					<TabsTrigger value="costumes">Costumes</TabsTrigger>
					{enableModelsVoices && (
						<>
							<TabsTrigger value="models">Models</TabsTrigger>
							<TabsTrigger value="voices">Voices</TabsTrigger>
						</>
					)}
				</TabsList>

				<TabsContent value="profile" className="mt-4">
					<Profile heroData={heroData} />
				</TabsContent>
				<TabsContent value="skills" className="mt-4">
					<Skills heroData={heroData} />
				</TabsContent>
				<TabsContent value="perks" className="mt-4">
					<Perks heroData={heroData} classPerks={classPerks} />
				</TabsContent>
				<TabsContent value="gear" className="mt-4">
					<Gear heroData={heroData} />
				</TabsContent>
				<TabsContent value="costumes" className="mt-4">
					<Costumes heroData={heroData} costumes={costumes} />
				</TabsContent>
				{enableModelsVoices && (
					<>
						<TabsContent value="models" className="mt-4">
							<DataHeavyContent
								description="This tab contains large 3D model files and textures that may consume significant mobile data."
								estimatedSize="20-40 MB per costume"
							>
								<Models
									heroModels={heroModels}
									availableScenes={availableScenes}
									voiceFiles={voiceFiles}
								/>
							</DataHeavyContent>
						</TabsContent>

						<TabsContent value="voices" className="mt-4">
							<DataHeavyContent
								description="This tab contains multiple voice audio files that may consume mobile data when played."
								estimatedSize="1-5 MB total"
							>
								<Voices heroData={heroData} voiceFiles={voiceFiles} />
							</DataHeavyContent>
						</TabsContent>
					</>
				)}
			</Tabs>
		</div>
	)
}
