import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Version Stats - King's Raid",
	description: "Compare game data changes between versions.",
	openGraph: {
		title: "Version Stats - King's Raid",
		description: "Compare game data changes between versions.",
	},
}

export default function StatsLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
