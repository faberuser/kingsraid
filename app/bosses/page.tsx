import fs from "fs"
import path from "path"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface BossInfo {
	"class": string
	"title": string
	"race": string
	"damage type": string
	"recommended heroes": string
	"characteristics": string
	"thumbnail": string
}

interface BossData {
	infos: BossInfo
	skills: any
	aliases?: string[]
}

async function getBossesData(): Promise<BossData[]> {
	try {
		const bossesDir = path.join(process.cwd(), "kingsraid-data", "table-data", "bosses")
		const files = fs.readdirSync(bossesDir)
		const jsonFiles = files.filter((file) => file.endsWith(".json"))

		const bosses: BossData[] = []

		for (const file of jsonFiles) {
			const filePath = path.join(bossesDir, file)
			const fileContent = fs.readFileSync(filePath, "utf-8")
			const bossData = JSON.parse(fileContent)
			bosses.push(bossData)
		}

		// Sort bosses alphabetically by class name
		return bosses.sort((a, b) => a.infos.class.localeCompare(b.infos.class))
	} catch (error) {
		console.error("Error reading bosses directory:", error)
		return []
	}
}

export default async function BossesPage() {
	const bosses = await getBossesData()

	return (
		<div className="container mx-auto py-8">
			<div className="mb-8">
				<div className="text-4xl font-bold mb-4">Bosses</div>
				<div className="text-muted-foreground">Study boss skills, mechanics and strategies.</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{bosses.map((boss) => (
					<Link
						key={boss.infos.class}
						href={`/bosses/${encodeURIComponent(boss.infos.class.toLowerCase().replace(/\s+/g, "-"))}`}
					>
						<Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-4">
									<div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
										<Image
											src={`/assets/${boss.infos.thumbnail}`}
											alt={boss.infos.class}
											fill
											className="object-cover"
										/>
									</div>
									<div className="flex-1">
										<CardTitle className="text-lg">{boss.infos.class}</CardTitle>
										<CardDescription className="text-sm">{boss.infos.title}</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex flex-wrap gap-2">
										<Badge variant="secondary">{boss.infos.race}</Badge>
										<Badge
											variant="default"
											className={
												boss.infos["damage type"] === "Physical" ? "bg-red-300" : "bg-blue-300"
											}
										>
											{boss.infos["damage type"]}
										</Badge>
									</div>
									<div className="text-sm text-muted-foreground line-clamp-3">
										{boss.infos.characteristics}
									</div>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
