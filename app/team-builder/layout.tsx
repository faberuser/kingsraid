import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Team Builder - King's Raid",
	description: "Build and share your King's Raid team compositions.",
	openGraph: {
		title: "Team Builder - King's Raid",
		description: "Build and share your King's Raid team compositions.",
	},
}

export default function TeamBuilderLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
