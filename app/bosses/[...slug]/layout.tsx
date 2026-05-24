import type { Metadata } from "next"
import { BossData } from "@/model/Boss"
import { SlugPageProps, findData } from "@/lib/get-data"

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params

	if (!slug || slug.length === 0) {
		return {
			title: "All Bosses",
			description: "Study boss skills, mechanics and strategies.",
			openGraph: {
				title: "All Bosses",
				description: "Study boss skills, mechanics and strategies.",
			},
		}
	}

	const bossData = (await findData(slug[0], "bosses")) as BossData | null

	if (!bossData) {
		return {
			title: "Boss Not Found",
			description: "The requested boss could not be found.",
			openGraph: {
				title: "Boss Not Found",
				description: "The requested boss could not be found.",
			},
		}
	}

	const displayName = bossData.profile.name
	const assetPath = "/kingsraid-data/assets/" + bossData.profile.thumbnail
	const thumbnail = `/_next/image?url=${encodeURIComponent(assetPath)}&w=1080&q=75`

	return {
		title: `${displayName} - Bosses`,
		description: `View boss ${displayName} details.`,
		openGraph: {
			title: `${displayName} - Bosses`,
			description: `View boss ${displayName} details.`,
			type: "website",
			images: thumbnail,
		},
	}
}

export default function BossesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
