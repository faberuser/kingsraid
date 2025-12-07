import BossesClient from "@/app/bosses/client"
import { BossData } from "@/model/Boss"
import { getData, getJsonData } from "@/lib/get-data"

export default async function BossesPage() {
	const bosses = (await getData("bosses")) as BossData[]
	const bossTypeMap = await getJsonData("table-data/boss_type.json")
	const releaseOrder = await getJsonData("table-data/boss_release_order.json")

	return <BossesClient bosses={bosses} bossTypeMap={bossTypeMap} releaseOrder={releaseOrder} />
}
