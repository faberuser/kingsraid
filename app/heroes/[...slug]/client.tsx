"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hero } from "@/model/Hero"
import Profile from "@/components/heroes/profile"

interface SlugClientProps {
	heroData: Hero
}

export default function SlugClient({ heroData }: SlugClientProps) {
	return (
		<div className="p-10 w-full">
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
					{heroData.skills ? (
						<div className="space-y-4">
							{Object.entries(heroData.skills).map(([skillKey, skill]) => (
								<div key={skillKey} className="border p-4 rounded">
									<h3 className="font-semibold">{skill.name}</h3>
									<p className="text-sm text-gray-600 mt-2">{skill.description}</p>
								</div>
							))}
						</div>
					) : (
						<p>No skill data available</p>
					)}
				</TabsContent>

				<TabsContent value="perks" className="mt-4">
					{heroData.perks ? (
						<div className="space-y-4">
							{Object.entries(heroData.perks).map(([perkCategory, perks]) => (
								<div key={perkCategory} className="space-y-2">
									<h3 className="font-semibold capitalize">{perkCategory}</h3>
									{typeof perks === "object" &&
										Object.entries(perks).map(([perkKey, perk]) => (
											<div key={perkKey} className="ml-4 border-l-2 pl-4">
												<h4 className="font-medium">{perkKey}</h4>
												{typeof perk === "object" && "effect" in perk && (
													<p className="text-sm text-gray-600">{perk.effect}</p>
												)}
											</div>
										))}
								</div>
							))}
						</div>
					) : (
						<p>No perk data available</p>
					)}
				</TabsContent>

				<TabsContent value="gear" className="mt-4">
					{heroData.uw ? (
						<div className="space-y-4">
							<div className="border p-4 rounded">
								<h3 className="font-semibold">Unique Weapon</h3>
								<h4 className="font-medium mt-2">{heroData.uw.name}</h4>
								<p className="text-sm text-gray-600 mt-2">{heroData.uw.description}</p>
							</div>
						</div>
					) : (
						<p>No gear data available</p>
					)}
				</TabsContent>

				<TabsContent value="costumes" className="mt-4">
					PLACEHOLDER
				</TabsContent>

				<TabsContent value="models" className="mt-4">
					PLACEHOLDER
				</TabsContent>
			</Tabs>
		</div>
	)
}
