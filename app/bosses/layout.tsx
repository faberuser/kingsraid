import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Bosses - King's Raid",
	description: "Study boss skills, mechanics and strategies.",
	openGraph: {
		title: "Bosses - King's Raid",
		description: "Study boss skills, mechanics and strategies.",
	},
}

export default function BossesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
