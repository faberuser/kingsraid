import BossesClient from "@/app/bosses/client"
import { BossData } from "@/model/Boss"
import { getDirData, getJsonData } from "@/components/server/get-data"

export default async function BossesPage() {
	const bosses = (await getDirData("bosses")) as BossData[]
	const bossTypeMap = await getJsonData("boss_type.json")

	return <BossesClient bosses={bosses} bossTypeMap={bossTypeMap} />
}
