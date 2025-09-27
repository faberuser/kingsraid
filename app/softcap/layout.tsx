import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Softcap - King's Raid",
	description: "Calculate actual stats after softcap adjustments.",
	openGraph: {
		title: "Softcap - King's Raid",
		description: "Calculate actual stats after softcap adjustments.",
	},
}

export default function SoftcapLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
