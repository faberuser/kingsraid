"use client"

import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Image from "@/components/next-image"
import { FeaturedHero } from "@/app/page"
import { NewsItem } from "@/lib/steam-rss"
import Autoplay from "embla-carousel-autoplay"
import { useState } from "react"
import { getImage, getContent, NewsDetailDialog } from "@/app/news/client"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

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
	featuredHeroes: FeaturedHero[]
	steamNews: NewsItem[]
}

export default function HomeClient({ featuredHeroes, steamNews }: HomeClientProps) {
	return (
		<div className="min-h-screen pb-12">
			<div className="container mx-auto">
				{/* Hero Section */}
				<div className="text-center mb-12 mt-0 md:mt-24">
					<div className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-[normal]">
						King&apos;s Raid Info
					</div>
					<div className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Comprehensive resource for King&apos;s Raid.
					</div>
				</div>

				{/* News Section */}
				{steamNews.length > 0 && (
					<div className="mb-16">
						<div className="text-center mb-8">
							<div className="text-3xl font-bold mb-2">Latest News</div>
							<div className="text-muted-foreground">Stay updated with Steam announcements</div>
						</div>
						<SteamRSS news={steamNews} />
					</div>
				)}

				{/* Heroes Showcase Carousel */}
				{featuredHeroes.length > 0 && (
					<div className="mb-16">
						<div className="text-center mb-8">
							<div className="text-3xl font-bold mb-2">Heroes</div>
							<div className="text-muted-foreground">Explore collection of heroes</div>
						</div>
						<FeaturedHeroes heroes={featuredHeroes} />
					</div>
				)}

				{/* Resources Grid */}
				<div>
					<div className="text-center mb-8">
						<div className="text-3xl font-bold mb-2">Resources</div>
						<div className="text-muted-foreground">King&apos;s Raid Communities</div>
					</div>
					<Communities />
				</div>
			</div>
		</div>
	)
}

function FeaturedHeroes({ heroes }: { heroes: FeaturedHero[] }) {
	return (
		<Carousel
			opts={{
				align: "start",
				loop: true,
			}}
			plugins={[
				Autoplay({
					delay: 2000,
				}),
			]}
		>
			<CarouselContent>
				{heroes.map((hero) => (
					<CarouselItem key={hero.name} className="basis-1/1 md:basis-1/2 xl:basis-1/3">
						<FeaturedHeroCard hero={hero} />
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious className="hidden md:flex" />
			<CarouselNext className="hidden md:flex" />
		</Carousel>
	)
}

function FeaturedHeroCard({ hero }: { hero: FeaturedHero }) {
	const [isLoading, setIsLoading] = useState(false)

	const handleClick = () => {
		if (isLoading) return // Prevent multiple clicks
		setIsLoading(true)
	}

	return (
		<Link
			href={`/heroes/${encodeURIComponent(hero.name.toLowerCase().replace(/\s+/g, "-"))}`}
			onClick={handleClick}
		>
			<div className="relative aspect-square overflow-hidden">
				<Image
					src={hero.image}
					alt={hero.name}
					width="0"
					height="0"
					sizes="80vw md:40vw"
					className="w-auto h-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-white/40 via-white/10 to-transparent dark:from-black/80 dark:via-black/20" />
				<div className="absolute bottom-0 left-0 right-0 p-6">
					<div className="text-2xl font-bold mb-1 capitalize">{hero.name}</div>
					<div className="text-sm">{hero.title}</div>
					<div className="text-xs mt-1 text-muted-foreground">{hero.class}</div>
				</div>
				{isLoading && (
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
						<Spinner className="size-8" />
					</div>
				)}
			</div>
		</Link>
	)
}

// Helper function to process HTML content
function processContent(html: string): string {
	// Find the first <img> tag
	const imgMatch = html.match(/<img[^>]*>/i)

	if (!imgMatch) {
		return `<div class="line-clamp-5">${html}</div>`
	}

	const imgTag = imgMatch[0]
	// Remove the image from the HTML
	const contentWithoutImg = html.replace(imgTag, "")

	return `
	<div class="h-full flex flex-col items-center justify-center mb- [&_img]:rounded">
		${imgTag}
	</div>
	<div class="line-clamp-5">
		${contentWithoutImg}
	</div>
	`
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
			<Carousel>
				<CarouselContent>
					{news.map((item, index) => (
						<CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
							<Card className="h-full gap-2 cursor-pointer" onClick={() => handleNewsClick(item)}>
								<CardHeader>
									<CardTitle className="line-clamp-2 flex justify-between items-center gap-2">
										{item.title}
										{new Date().getTime() - new Date(item.date).getTime() <
											7 * 24 * 60 * 60 * 1000 && <Badge className="text-xs">New</Badge>}
									</CardTitle>
									<CardDescription>{new Date(item.date).toLocaleDateString()}</CardDescription>
								</CardHeader>
								<CardContent className="h-full">
									<div
										className="text-sm text-muted-foreground h-full flex flex-col justify-between"
										dangerouslySetInnerHTML={{ __html: processContent(item.contents) }}
									/>
								</CardContent>
							</Card>
						</CarouselItem>
					))}
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
