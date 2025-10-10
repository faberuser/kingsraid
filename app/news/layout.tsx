import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "News - King's Raid",
	description: "Latest news and updates from King's Raid.",
	openGraph: {
		title: "News - King's Raid",
		description: "Latest news and updates from King's Raid.",
	},
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
