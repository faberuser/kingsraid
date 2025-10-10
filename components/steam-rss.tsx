"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { NewsItem } from "@/app/page"
import { Badge } from "@/components/ui/badge"

interface SteamRSSProps {
	news: NewsItem[]
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
	<div class="h-full flex flex-col items-center justify-center mb-2 [&_img]:rounded">
		${imgTag}
	</div>
	<div class="line-clamp-5">
		${contentWithoutImg}
	</div>
	`
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
							<Card className="h-full gap-2">
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
						</Link>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious className="hidden md:flex" />
			<CarouselNext className="hidden md:flex" />
		</Carousel>
	)
}
