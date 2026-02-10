export interface BossInfo {
	name: string
	title: string
	type: string[]
	race: string
	damage_type: string
	recommended_heroes: string
	characteristics: string
	thumbnail: string
}

export interface Skill {
	name: string
	cost: string | null
	cooldown: string | null
	description: string
}

export interface BossData {
	profile: BossInfo
	skills: {
		[skillId: string]: Skill
	}
	aliases?: string[] | null
}
