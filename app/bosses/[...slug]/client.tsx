"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "@/components/next-image"
import { BossData } from "@/model/Boss"
import { ModelFile } from "@/model/Hero_Model"
import BossModels from "@/components/bosses/models"
import DataHeavyContent from "@/components/data-heavy-content"

// Boss models are now organized by variant (similar to hero costumes)
type BossModelData = Record<string, ModelFile[]>

interface BossClientProps {
	bossData: BossData
	bossModels?: BossModelData
	bossScenes?: Array<{ value: string; label: string }>
	enableModelsVoices?: boolean
}

export default function BossClient({
	bossData,
	bossModels,
	bossScenes = [],
	enableModelsVoices = false,
}: BossClientProps) {
	const { profile, skills } = bossData

	// Helper function to get tab from hash
	const getTabFromHash = () => {
		if (typeof window === "undefined") return "profile_skills"
		const hash = window.location.hash.slice(1) // Remove the '#'
		const validTabs = ["profile_skills", "models"]
		return validTabs.includes(hash) ? hash : "profile_skills"
	}

	// State to track active tab - initialize from URL hash
	const [activeTab, setActiveTab] = useState<string>(getTabFromHash)

	// Listen for hash changes (e.g., browser back/forward)
	useEffect(() => {
		const handleHashChange = () => {
			setActiveTab(getTabFromHash())
		}

		window.addEventListener("hashchange", handleHashChange)
		return () => window.removeEventListener("hashchange", handleHashChange)
	}, [])

	// Update URL hash when tab changes
	const handleTabChange = (value: string) => {
		setActiveTab(value)
		window.history.pushState(null, "", `#${value}`)
	}

	return (
		<div>
			{/* Boss Header */}
			<div className="flex flex-row gap-4 items-center pb-2">
				{/* Boss Image */}
				<div className="shrink-0 relative">
					<div className="w-16 h-16 md:w-20 md:h-20">
						<Image
							src={`/kingsraid-data/assets/${profile.thumbnail}`}
							alt={profile.name}
							width="0"
							height="0"
							sizes="20vw md:5vw"
							className="w-full h-auto rounded"
						/>
					</div>
				</div>
				{/* Boss Name & Info */}
				<div className="flex-grow min-w-0">
					<div className="flex flex-col">
						<h1 className="text-2xl md:text-3xl font-bold truncate">{profile.name}</h1>
						<span className="text-sm md:text-base text-muted-foreground">{profile.title}</span>
					</div>
					<div className="flex flex-wrap gap-2 mt-2">
						{bossData.profile.type.map((type) => (
							<Badge key={type} variant="default">
								{type}
							</Badge>
						))}
						<Badge variant="secondary">{profile.race}</Badge>
						<Badge
							variant="default"
							className={
								profile.damage_type === "Physical"
									? "bg-red-300"
									: profile.damage_type === "Magical"
										? "bg-blue-300"
										: "bg-yellow-300"
							}
						>
							{profile.damage_type}
						</Badge>
					</div>
				</div>
			</div>

			{/* Tabs Section */}
			<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-2">
				<TabsList className="w-full overflow-x-auto overflow-y-hidden flex-nowrap justify-start">
					<TabsTrigger value="profile_skills">Profile & Skills</TabsTrigger>
					{enableModelsVoices && bossModels && Object.keys(bossModels).length > 0 && (
						<TabsTrigger value="models">Models</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value="profile_skills" className="mt-4">
					<div className="space-y-4">
						<div className="grid md:grid-cols-2 gap-6">
							<Card className="gap-2">
								<CardHeader>
									<CardTitle>Characteristics</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-sm">{profile.characteristics}</div>
								</CardContent>
							</Card>

							<Card className="gap-2">
								<CardHeader>
									<CardTitle>Recommended Heroes</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-sm">{profile.recommended_heroes}</div>
								</CardContent>
							</Card>
						</div>

						{Object.entries(skills).map(([skillId, skill]) => (
							<Card key={skillId} className="gap-2">
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex flex-row gap-2 items-center">
											<CardTitle
												className={`text-lg ${
													profile.damage_type === "Physical"
														? "text-red-300"
														: profile.damage_type === "Magical"
															? "text-blue-300"
															: "text-yellow-400"
												}`}
											>
												{skill.name}
											</CardTitle>
											<div className="flex gap-2">
												{skill.cost && (
													<Badge
														variant="default"
														className="bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900"
													>
														Cost: {skill.cost}
													</Badge>
												)}
												{skill.cooldown && (
													<Badge
														variant="default"
														className="bg-orange-100 text-orange-800 dark:bg-orange-200 dark:text-orange-900"
													>
														Cooldown: {skill.cooldown}s
													</Badge>
												)}
											</div>
										</div>
										<Badge variant="secondary">#{skillId}</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="text-sm">{skill.description}</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				{enableModelsVoices && bossModels && Object.keys(bossModels).length > 0 && (
					<TabsContent value="models" className="mt-4">
						<DataHeavyContent
							description="This tab contains large 3D model files and textures that may consume significant mobile data."
							estimatedSize="30-60 MB"
						>
							<BossModels bossModels={bossModels} bossScenes={bossScenes} bossName={profile.name} />
						</DataHeavyContent>
					</TabsContent>
				)}
			</Tabs>
		</div>
	)
}
