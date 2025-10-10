export interface NewsItem {
	title: string
	url: string
	date: string
	contents: string
}

export async function getSteamNews(limit?: number): Promise<NewsItem[]> {
	try {
		const response = await fetch("https://store.steampowered.com/feeds/news/app/3689540/", {
			next: { revalidate: 3600 }, // Revalidate every hour
		})

		const text = await response.text()

		// Parse RSS XML
		const items: NewsItem[] = []
		const itemRegex = /<item>([\s\S]*?)<\/item>/g
		let match

		while ((match = itemRegex.exec(text)) !== null) {
			const itemContent = match[1]

			// Extract CDATA content more precisely
			const extractCDATA = (tag: string, content: string): string => {
				const cdataMatch = content.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "s"))
				if (cdataMatch) return cdataMatch[1].trim()

				const regularMatch = content.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "s"))
				return regularMatch ? regularMatch[1].trim() : ""
			}

			// Decode HTML entities on server side
			const decodeHtmlEntities = (str: string): string => {
				return str
					.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">")
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'")
					.replace(/&amp;/g, "&")
			}

			const title = extractCDATA("title", itemContent)
			const url = extractCDATA("link", itemContent)
			const date = extractCDATA("pubDate", itemContent)
			const contents = decodeHtmlEntities(extractCDATA("description", itemContent))

			items.push({
				title,
				url,
				date,
				contents,
			})
		}

		if (limit) {
			return items.slice(0, limit) // Limit items
		}
		return items
	} catch (error) {
		console.error("Error fetching Steam news:", error)
		return []
	}
}
