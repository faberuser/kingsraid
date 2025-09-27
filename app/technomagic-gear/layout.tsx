import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Technomagic Gear - King's Raid",
	description: "Explore technomagic gear and their effects.",
	openGraph: {
		title: "Technomagic Gear - King's Raid",
		description: "Explore technomagic gear and their effects.",
	},
}

export default function TechnomagicGearLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
