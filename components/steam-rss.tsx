"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { NewsItem } from "@/app/page"

interface SteamRSSProps {
	news: NewsItem[]
}

export default function SteamRSS({ news }: SteamRSSProps) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (news.length === 0) {
		return (
			<div className="text-center py-8">
				<div className="text-muted-foreground">No news available</div>
			</div>
		)
	}

	if (!mounted) {
		return (
			<div className="text-center py-8">
				<div className="text-muted-foreground">Loading news...</div>
			</div>
		)
	}

	return (
		<Carousel
			opts={{
				align: "start",
			}}
		>
			<CarouselContent>
				{news.map((item, index) => (
					<CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
						<Link href={item.url} target="_blank" rel="noopener noreferrer">
							<Card className="h-full hover:shadow-lg transition-shadow">
								<CardHeader>
									<CardTitle className="line-clamp-2">{item.title}</CardTitle>
									<CardDescription>
										{new Date(item.date).toLocaleDateString()} • King's Raid
									</CardDescription>
								</CardHeader>
								<CardContent suppressHydrationWarning>
									<div
										className="text-sm text-muted-foreground line-clamp-3 [&_img]:rounded-md [&_img]:mb-5 [&_p]:inline"
										dangerouslySetInnerHTML={{ __html: item.contents }}
										suppressHydrationWarning
									/>
								</CardContent>
							</Card>
						</Link>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious className="hidden md:flex" />
			<CarouselNext className="hidden md:flex" />
		</Carousel>
	)
}
