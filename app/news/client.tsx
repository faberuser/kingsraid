"use client"

import { NewsItem } from "@/lib/steam-rss"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Eye, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const getImage = (html: string): string | null => {
	const imgMatch = html.match(/<img[^>]*>/i)
	if (!imgMatch) return ""
	const srcMatch = imgMatch[0].match(/src=["']([^"']+)["']/i)
	return srcMatch ? srcMatch[1] : ""
}

export const getContent = (html: string): string => {
	const imgMatch = getImage(html)
	if (!imgMatch) {
		return html
	}
	const contentWithoutImg = html.replace(imgMatch, "")
	return contentWithoutImg
}

export default function NewsClient({ steamNews }: { steamNews: NewsItem[] }) {
	const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const handleNewsClick = (news: NewsItem) => {
		setSelectedNews(news)
		setIsDialogOpen(true)
	}

	return (
		<div className="space-y-4 mb-4 mt-1">
			{/* Header */}
			<div className="flex flex-row gap-2 items-baseline">
				<div className="text-xl font-bold">News Hub</div>
				<div className="text-muted-foreground text-sm">Showing {steamNews.length} news</div>
			</div>

			<Separator />

			{/* News Grid */}
			<div className="grid grid-cols-1 gap-4">
				{steamNews.map((news, index) => {
					const imageSrc = getImage(news.contents)

					return (
						<Card
							key={index}
							className="overflow-hidden cursor-pointer flex flex-col lg:flex-row justify-between gap-0 hover:scale-102 transition-transform"
							onClick={() => handleNewsClick(news)}
						>
							{imageSrc && (
								<Image
									width="0"
									height="0"
									sizes="80vw md:40vw"
									src={imageSrc}
									alt={news.title}
									className="w-full h-auto lg:w-100 lg:h-full object-contain rounded px-6 mb-4 lg:mb-0 lg:px-0 lg:ml-6"
								/>
							)}

							<div className="flex flex-col justify-between gap-4 w-full">
								<div className="flex flex-col gap-4">
									<CardHeader>
										<CardTitle className="text-xl font-semibold">{news.title}</CardTitle>
										<CardDescription className="text-sm whitespace-nowrap">
											{new Date(news.date).toLocaleDateString()}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div
											className="text-muted-foreground line-clamp-5"
											dangerouslySetInnerHTML={{ __html: getContent(news.contents) }}
										/>
									</CardContent>
								</div>
								<CardFooter className="flex items-center gap-2 text-sm text-muted-foreground">
									<Eye className="w-4 h-4" />
									View More
								</CardFooter>
							</div>
						</Card>
					)
				})}
			</div>

			{/* No News Message */}
			{steamNews.length === 0 && (
				<div className="text-center py-16">
					<div className="text-muted-foreground text-lg">No news available at the moment.</div>
				</div>
			)}

			{/* News Detail Dialog */}
			<NewsDetailDialog
				news={selectedNews}
				imgSrc={selectedNews ? getImage(selectedNews.contents) || undefined : undefined}
				content={selectedNews ? getContent(selectedNews.contents) : undefined}
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</div>
	)
}

export function NewsDetailDialog({
	news,
	imgSrc,
	content,
	isOpen,
	onOpenChange,
}: {
	news: NewsItem | null
	imgSrc?: string
	content?: string
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}) {
	if (!news) return null

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[90vw] md:min-w-[60vw] lg:min-w-[50vw] xl:min-w-[40vw] max-h-[90vh] overflow-y-auto custom-scrollbar">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">{news.title}</DialogTitle>
					<DialogDescription className="text-sm">
						{new Date(news.date).toLocaleDateString()}
					</DialogDescription>
				</DialogHeader>

				{imgSrc && (
					<Image
						src={imgSrc}
						alt={news.title}
						width="0"
						height="0"
						sizes="80vw"
						className="h-auto w-full object-contain rounded"
					/>
				)}

				<div className="space-y-2" dangerouslySetInnerHTML={{ __html: content ?? "" }} />

				<Button asChild>
					<Link href={news.url} target="_blank" rel="noopener noreferrer" className="gap-2">
						View on Steam
						<ExternalLink className="w-4 h-4" />
					</Link>
				</Button>
			</DialogContent>
		</Dialog>
	)
}
