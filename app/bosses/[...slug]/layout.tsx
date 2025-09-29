import type { Metadata } from "next"
import { BossData } from "@/model/Boss"
import { SlugPageProps, getFileData } from "@/components/server/get-data"

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
	const { slug } = await params

	if (!slug || slug.length === 0) {
		return {
			title: "All Bosses - King's Raid",
			description: "Study boss skills, mechanics and strategies.",
			openGraph: {
				title: "All Bosses - King's Raid",
				description: "Study boss skills, mechanics and strategies.",
			},
		}
	}

	const bossData = (await getFileData(slug[0], "bosses")) as BossData | null

	if (!bossData) {
		return {
			title: "Boss Not Found - King's Raid",
			description: "The requested boss could not be found.",
			openGraph: {
				title: "Boss Not Found - King's Raid",
				description: "The requested boss could not be found.",
			},
		}
	}

	const displayName = bossData.infos.name
	const thumbnail = bossData.infos.thumbnail

	return {
		title: `${displayName} - Bosses - King's Raid`,
		description: `View boss ${displayName} details.`,
		openGraph: {
			title: `${displayName} - Bosses - King's Raid`,
			description: `View boss ${displayName} details.`,
			images: thumbnail
				? [
						{
							url: thumbnail,
							width: 512,
							height: 512,
							alt: `${displayName}`,
						},
				  ]
				: undefined,
		},
	}
}

export default function BossesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
