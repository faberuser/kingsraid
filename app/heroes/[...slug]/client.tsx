"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hero } from "@/model/Hero"
import Profile from "@/components/heroes/profile"
import Skills from "@/components/heroes/skills"
import Perks from "@/components/heroes/perks"
import Gear from "@/components/heroes/gear"
import Costumes from "@/components/heroes/costumes"
import Models from "@/components/heroes/models"

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
