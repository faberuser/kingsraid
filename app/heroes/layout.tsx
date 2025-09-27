import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Heroes - King's Raid",
	description: "Discover heroes, skills, gears, and more.",
	openGraph: {
		title: "Heroes - King's Raid",
		description: "Discover heroes, skills, gears, and more.",
	},
}

export default function HeroesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
