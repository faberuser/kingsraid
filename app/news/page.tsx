import NewsClient from "@/app/news/client"
import { getSteamNews } from "@/lib/steam-rss"

export default async function NewsPage() {
	const steamNews = await getSteamNews()

	return <NewsClient steamNews={steamNews} />
}
