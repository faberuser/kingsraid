import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import BossClient from "@/app/bosses/[...slug]/client"
import { BossData } from "@/model/Boss"
import { SlugPageProps, findData } from "@/lib/get-data"

export async function generateStaticParams() {
	const bossesDir = path.join(process.cwd(), "public", "kingsraid-data", "table-data", "bosses")
	const slugs: string[] = []

	if (fs.existsSync(bossesDir)) {
		const files = fs.readdirSync(bossesDir).filter((file) => file.endsWith(".json"))
		for (const file of files) {
			const name = file.replace(".json", "")
			slugs.push(name)
		}
	}

	return slugs.map((slug) => ({ slug: [slug] }))
}

export default async function SlugPage({ params }: SlugPageProps) {
	const { slug } = await params
	const bossName = slug?.[0]

	if (!bossName) {
		notFound()
	}

	const bossData = (await findData(bossName, "bosses")) as BossData | null

	if (!bossData) {
		notFound()
	}

	return <BossClient bossData={bossData} />
}
