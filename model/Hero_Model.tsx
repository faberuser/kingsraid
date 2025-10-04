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
		| "hair"
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
}

export interface HairTextureInfo {
	hair?: string
	ornament?: string
}

export interface TextureInfo {
	diffuse?: string
	eye?: string
	wing?: string
	arm?: string
}

export interface ModelWithTextures extends ModelFile {
	textures: TextureInfo | HairTextureInfo
}
