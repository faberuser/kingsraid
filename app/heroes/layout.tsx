import type { Metadata } from "next"
import { HeroesLayoutClient } from "@/app/heroes/layout-client"

export const metadata: Metadata = {
	title: "Heroes - King's Raid",
	description: "Discover heroes, skills, gears, and more.",
	openGraph: {
		title: "Heroes - King's Raid",
		description: "Discover heroes, skills, gears, and more.",
	},
}

export default function HeroesLayout({ children, modal }: { children: React.ReactNode; modal?: React.ReactNode }) {
	return <HeroesLayoutClient modal={modal}>{children}</HeroesLayoutClient>
}
