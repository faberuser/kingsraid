import BossesClient from "@/app/bosses/client"
import { BossData } from "@/model/Boss"
import { getData, getJsonData } from "@/lib/get-data"

export default async function BossesPage() {
	const bosses = (await getData("bosses")) as BossData[]
	const bossTypeMap = await getJsonData("boss_type.json")

	return <BossesClient bosses={bosses} bossTypeMap={bossTypeMap} />
}
