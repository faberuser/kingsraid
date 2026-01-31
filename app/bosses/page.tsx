import BossesPageWrapper from "@/app/bosses/page-wrapper"
import { BossData } from "@/model/Boss"
import { getData, getJsonData } from "@/lib/get-data"

export default async function BossesPage() {
	const bosses = (await getData("bosses")) as BossData[]
	const bossTypeMap = await getJsonData("table-data/legacy/boss_type.json")
	const releaseOrder = await getJsonData("table-data/legacy/boss_release_order.json")

	return <BossesPageWrapper bosses={bosses} bossTypeMap={bossTypeMap} releaseOrder={releaseOrder} />
}
