import type { Metadata } from "next"
import { HeroData } from "@/model/Hero"
import { SlugPageProps, getDirData } from "@/components/server/get-data"

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params

	if (!slug || slug.length === 0) {
		return {
			title: "All Heroes - King's Raid",
			description: "Discover heroes, skills, gears, and more.",
			openGraph: {
				title: "All Heroes - King's Raid",
				description: "Discover heroes, skills, gears, and more.",
			},
		}
	}

	const heroData = (await getDirData(slug[0], "heroes")) as HeroData | null

	if (!heroData) {
		return {
			title: "Hero Not Found - King's Raid",
			description: "The requested hero could not be found.",
			openGraph: {
				title: "Hero Not Found - King's Raid",
				description: "The requested hero could not be found.",
			},
		}
	}

	const displayName = heroData.infos.name

	return {
		title: `${displayName} - Heroes - King's Raid`,
		description: `View hero ${displayName} details.`,
		openGraph: {
			title: `${displayName} - Heroes - King's Raid`,
			description: `View hero ${displayName} details.`,
		},
	}
}

export default function HeroesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
