"use client"

import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Image from "@/components/next-image"
import type { NewsItem } from "@/lib/steam-rss"
import { useState } from "react"
import { getImage, getContent, getPreviewText, NewsDetailDialog } from "@/app/news/client"
import { Badge } from "@/components/ui/badge"

const communities = [
	{
		name: "Official X (Twitter)",
		thumbnail: "/images/communities/x.png",
		url: "https://x.com/kingsraid_msg",
		description: "Follow the official X account for the latest updates and announcements.",
	},
	{
		name: "Official Discord",
		thumbnail: "/images/communities/official-discord.png",
		url: "https://discord.com/invite/TyvYcF4gjn",
		description: "Connect with other players on the official King's Raid Discord server.",
	},
	{
		name: "Reddit",
		thumbnail: "/images/communities/reddit.png",
		url: "https://www.reddit.com/r/Kings_Raid/",
		description: "Join the King's Raid subreddit for discussions, news, and fan content.",
	},
]

interface HomeClientProps {
	steamNews: NewsItem[]
}

export default function HomeClient({ steamNews }: HomeClientProps) {
	return (
		<div className="min-h-screen flex flex-col justify-center">
			<div className="container mx-auto my-auto space-y-10">
				{/* Hero Section */}
				<div className="text-center p-2 md:p-0 space-y-4">
					<div
						className="text-3xl leading-[normal]"
						style={{ fontFamily: "var(--font-comfortaa)", fontWeight: 700 }}
					>
						King&apos;s Raid Info
					</div>
					<div className="text-lg text-muted-foreground max-w-2xl mx-auto">
						King&apos;s Raid was originally released in 2016 by Vespa Inc (changed to Anic Inc), then End of
						Service in 2025 and is undergoing a relaunch by Masangsoft in 2026.
						<br />
						This site aims to provide the latest resources for the game and its community.
					</div>
				</div>

				{/* News Section */}
				{steamNews.length > 0 && (
					<div className="space-y-4 p-2 md:p-0">
						<div className="text-center">
							<div className="text-2xl font-bold mb-2">Latest News</div>
							<div className="text-muted-foreground">Steam Announcements</div>
						</div>
						<SteamRSS news={steamNews} />
					</div>
				)}

				{/* Resources Grid */}
				<div className="space-y-4">
					<div className="text-center">
						<div className="text-2xl font-bold mb-2">Resources</div>
						<div className="text-muted-foreground">King&apos;s Raid Communities</div>
					</div>
					<Communities />
				</div>
			</div>
		</div>
	)
}

interface SteamRSSProps {
	news: NewsItem[]
}

function SteamRSS({ news }: SteamRSSProps) {
	const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const handleNewsClick = (news: NewsItem) => {
		setSelectedNews(news)
		setIsDialogOpen(true)
	}

	if (news.length === 0) {
		return (
			<div className="text-center py-8">
				<div className="text-muted-foreground">No news available</div>
			</div>
		)
	}

	return (
		<>
			<Carousel className="w-full h-full">
				<CarouselContent className="w-full items-stretch">
					{news.map((item, index) => {
						const imageSrc = getImage(item.contents)
						const previewText = getPreviewText(item.contents)

						return (
							<CarouselItem key={index} className="flex md:basis-1/2 xl:basis-1/3">
								<Card
									className="h-full w-full gap-2 overflow-hidden cursor-pointer"
									onClick={() => handleNewsClick(item)}
								>
									<CardHeader className="h-24 shrink-0">
										<CardTitle className="flex items-start justify-between gap-2">
											<span className="line-clamp-2">{item.title}</span>
											{item.isNew ? <Badge className="shrink-0 text-xs">New</Badge> : null}
										</CardTitle>
										<CardDescription>{item.formattedDate}</CardDescription>
									</CardHeader>
									<CardContent className="flex flex-col gap-4 overflow-hidden">
										<div className="flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/20">
											{imageSrc ? (
												<Image
													src={imageSrc}
													alt={item.title}
													width="0"
													height="0"
													sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
													className="h-full w-full object-cover object-center"
												/>
											) : null}
										</div>
										<div className="line-clamp-5 text-sm text-muted-foreground">{previewText}</div>
									</CardContent>
								</Card>
							</CarouselItem>
						)
					})}
				</CarouselContent>
				<CarouselPrevious className="hidden md:flex" />
				<CarouselNext className="hidden md:flex" />
			</Carousel>

			{/* News Detail Dialog */}
			<NewsDetailDialog
				news={selectedNews}
				imgSrc={selectedNews ? getImage(selectedNews.contents) || undefined : undefined}
				content={selectedNews ? getContent(selectedNews.contents) : undefined}
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</>
	)
}

function Communities() {
	return (
		<div className="flex flex-wrap justify-center gap-6">
			{communities.map((community) => (
				<Link key={community.name} href={community.url} target="_blank" rel="noreferrer">
					<Card className="w-72 h-full hover:shadow-lg transition-shadow flex flex-col">
						<CardHeader className="flex-1">
							<CardTitle className="flex flex-row items-center gap-4">
								<div className="relative w-10 h-10 aspect-square overflow-hidden rounded-lg">
									<Image
										src={community.thumbnail}
										alt={community.name}
										width="0"
										height="0"
										sizes="30vw md:10vw"
										className="w-full h-auto object-cover"
									/>
								</div>
								{community.name}
							</CardTitle>
							<CardDescription>{community.description}</CardDescription>
						</CardHeader>
					</Card>
				</Link>
			))}
		</div>
	)
}
