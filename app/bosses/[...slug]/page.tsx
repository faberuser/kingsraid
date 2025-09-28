import { notFound } from "next/navigation"
import BossClient from "@/app/bosses/[...slug]/client"
import { BossData } from "@/model/Boss"
import { SlugPageProps, getFileData } from "@/components/server/get-data"

export default async function SlugPage({ params }: SlugPageProps) {
	const { slug } = await params
	const bossName = slug?.[0]

	if (!bossName) {
		notFound()
	}

	const bossData = (await getFileData(bossName, "bosses")) as BossData | null

	if (!bossData) {
		notFound()
	}

	return <BossClient bossData={bossData} />
}
