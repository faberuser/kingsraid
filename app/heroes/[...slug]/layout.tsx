import type { Metadata } from "next"
import { HeroData } from "@/model/Hero"
import { SlugPageProps, findData } from "@/lib/get-data"

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

	const heroData = (await findData(slug[0], "heroes")) as HeroData | null

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

	const displayName = heroData.profile.name
	const assetPath = "/kingsraid-data/assets/" + heroData.profile.thumbnail
	const thumbnail = `/_next/image?url=${encodeURIComponent(assetPath)}&w=1080&q=75`

	return {
		title: `${displayName} - Heroes - King's Raid`,
		description: `View hero ${displayName} details.`,
		openGraph: {
			title: `${displayName} - Heroes - King's Raid`,
			description: `View hero ${displayName} details.`,
			type: "website",
			images: thumbnail,
		},
	}
}

export default function HeroesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
