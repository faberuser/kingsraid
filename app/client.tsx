"use client"

import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { FeaturedHero, NewsItem } from "@/app/page"
import Autoplay from "embla-carousel-autoplay"
import SteamRSS from "@/components/steam-rss"

const communities = [
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
						King's Raid Info
					</div>
					<div className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Comprehensive resource for Kings Raid.
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
								{featuredHeroes.map((hero) => (
									<CarouselItem key={hero.name} className="basis-1/1 md:basis-1/2 xl:basis-1/3">
										<Link
											href={`/heroes/${encodeURIComponent(
												hero.name.toLowerCase().replace(/\s+/g, "-")
											)}`}
										>
											<div className="relative aspect-square overflow-hidden">
												<Image
													src={hero.image}
													alt={hero.name}
													width="0"
													height="0"
													sizes="80vw md:40vw"
													className="w-auto h-full object-cover group-hover:scale-110 transition-transform duration-500"
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-white/40 via-white/10 to-transparent dark:from-black/80 dark:via-black/20" />
												<div className="absolute bottom-0 left-0 right-0 p-6">
													<div className="text-2xl font-bold mb-1 capitalize">
														{hero.name}
													</div>
													<div className="text-sm">{hero.title}</div>
													<div className="text-xs mt-1 text-muted-foreground">
														{hero.class}
													</div>
												</div>
											</div>
										</Link>
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious className="hidden md:flex" />
							<CarouselNext className="hidden md:flex" />
						</Carousel>
					</div>
				)}

				{/* Resources Grid */}
				<div>
					<div className="text-center mb-8">
						<div className="text-3xl font-bold mb-2">Resources</div>
						<div className="text-muted-foreground">King's Raid Communities</div>
					</div>

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
				</div>
			</div>
		</div>
	)
}
