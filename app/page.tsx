import HomeClient from "@/app/client"
import { getSteamNews } from "@/lib/steam-rss"

export interface FeaturedHero {
	name: string
	title: string
	class: string
	image: string
}

export default async function Home() {
	const steamNews = await getSteamNews(6) // Limit to 6 news items

	return <HomeClient steamNews={steamNews} />
}
