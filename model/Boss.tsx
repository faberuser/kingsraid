export interface BossInfo {
	"class": string
	"title": string
	"race": string
	"damage type": string
	"recommended heroes": string
	"characteristics": string
	"thumbnail": string
}

export interface Skill {
	name: string
	cost: string | null
	cooldown: string | null
	description: string
}

export interface BossData {
	infos: BossInfo
	skills: {
		[skillId: string]: Skill
	}
	aliases?: string[]
}
