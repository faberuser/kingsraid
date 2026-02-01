import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Team Builder - King's Raid",
	description:
		"Build and share your King's Raid team compositions with heroes, unique weapons, unique treasures, and perks.",
	openGraph: {
		title: "Team Builder - King's Raid",
		description:
			"Build and share your King's Raid team compositions with heroes, unique weapons, unique treasures, and perks.",
	},
}

export default function TeamBuilderLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
