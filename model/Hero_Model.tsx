export interface Costume {
	name: string
	path: string
	displayName: string
}

export interface ModelFile {
	name: string
	path: string
	type:
		| "body"
		| "arms"
		| "arm"
		| "hair"
		| "hood"
		| "hood_hair"
		| "hoodopen"
		| "hoodopen_hair"
		| "handle"
		| "weapon"
		| "weapon01"
		| "weapon02"
		| "weapon_blue"
		| "weapon_red"
		| "weapon_open"
		| "weapon_close"
		| "weapon_a"
		| "weapon_b"
		| "weapona"
		| "weaponb"
		| "weapon_r"
		| "weapon_l"
		| "weaponr"
		| "weaponl"
		| "weaponbottle"
		| "weaponpen"
		| "weaponscissors"
		| "weaponskein"
		| "shield"
		| "sword"
		| "lance"
		| "gunblade"
		| "axe"
		| "arrow"
		| "quiver"
		| "sheath"
		| "bag"
		| "mask"
	defaultPosition?: boolean
}
