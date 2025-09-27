"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hero } from "@/model/Hero"
import Profile from "@/components/heroes/profile"
import Skills from "@/components/heroes/skills"
import Perks from "@/components/heroes/perks"
import Gear from "@/components/heroes/gear"
import Costumes from "@/components/heroes/costumes"
import Models from "@/components/heroes/models"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { capitalize, classColorMapText } from "@/lib/utils"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

interface Costume {
	name: string
	path: string
	displayName: string
}

interface SlugClientProps {
	heroData: Hero
	costumes: Costume[]
}

export default function SlugClient({ heroData, costumes }: SlugClientProps) {
	return (
		<div className="py-0 px-2 sm:py-10 sm:px-20 w-full">
			{/* Back Button */}
			<div className="mb-6">
				<Link href="/heroes">
					<Button variant="ghost" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to Heroes
					</Button>
				</Link>
			</div>

			{/* Hero Basic Info */}
			<div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-start pb-2">
				{/* Hero Image */}
				<div className="flex items-center justify-center self-stretch">
					<div className="w-32 h-32 md:w-40 md:h-40">
						<Image
							src={`/assets/${heroData.infos.thumbnail}`}
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
						<div className={`text-lg font-semibold ${classColorMapText(heroData.infos.class)}`}>
							{heroData.infos.title}
						</div>
					</div>

					<Separator className="mb-4" />

					<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
						<div className="px-3 py-1 rounded border-l-4 border-blue-500">
							<div className="font-semibold">Class</div>
							<div>{heroData.infos.class}</div>
						</div>
						<div className="px-3 py-1 rounded border-l-4 border-green-500">
							<div className="font-semibold">Position</div>
							<div>{heroData.infos.position}</div>
						</div>
						<div className="px-3 py-1 rounded border-l-4 border-red-500">
							<div className="font-semibold">Damage Type</div>
							<div>{heroData.infos["damage type"]}</div>
						</div>
						<div className="px-3 py-1 rounded border-l-4 border-yellow-500">
							<div className="font-semibold">Attack Range</div>
							<div>{heroData.infos["attack range"]}</div>
						</div>
						<div className="px-3 py-1 rounded border-l-4 border-pink-500">
							<div className="font-semibold">Gender</div>
							<div>{heroData.infos.gender}</div>
						</div>
						<div className="px-3 py-1 rounded border-l-4 border-indigo-500">
							<div className="font-semibold">Race</div>
							<div>{heroData.infos.race}</div>
						</div>
					</div>
				</div>
			</div>

			<Tabs defaultValue="profile" className="w-full mt-4">
				<TabsList className="w-full">
					<TabsTrigger value="profile">Profile</TabsTrigger>
					<TabsTrigger value="skills">Skills</TabsTrigger>
					<TabsTrigger value="perks">Perks</TabsTrigger>
					<TabsTrigger value="gear">Gear</TabsTrigger>
					<TabsTrigger value="costumes">Costumes</TabsTrigger>
					<TabsTrigger value="models">Models</TabsTrigger>
				</TabsList>

				<TabsContent value="profile" className="mt-4">
					<Profile heroData={heroData} />
				</TabsContent>

				<TabsContent value="skills" className="mt-4">
					<Skills heroData={heroData} />
				</TabsContent>

				<TabsContent value="perks" className="mt-4">
					<Perks heroData={heroData} />
				</TabsContent>

				<TabsContent value="gear" className="mt-4">
					<Gear heroData={heroData} />
				</TabsContent>

				<TabsContent value="costumes" className="mt-4">
					<Costumes heroData={heroData} costumes={costumes} />
				</TabsContent>

				<TabsContent value="models" className="mt-4">
					<Models heroData={heroData} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
