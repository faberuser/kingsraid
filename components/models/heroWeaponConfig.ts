import type { ModelFile } from "@/model/Hero_Model"
import { weaponTypes } from "./types"

interface HeroWeaponConfig {
	recalculateBoneInverses?: boolean
	rotation?: { x: number; y: number; z: number }
	hand?: "left" | "right"
	attachment?: "scene"
	animationNaming?: "body" | "facialWeapon"
}

const medianaWeaponConfig: HeroWeaponConfig = {
	recalculateBoneInverses: true,
	rotation: { x: 0, y: 0, z: 0 },
}

const isaiahWeaponAConfig: HeroWeaponConfig = { hand: "left" }
const isaiahWeaponBConfig: HeroWeaponConfig = {
	hand: "right",
	rotation: { x: 0, y: 0, z: 0 },
}

const gremoryWeaponConfig: HeroWeaponConfig = { attachment: "scene" }
const nickyWeaponConfig: HeroWeaponConfig = { attachment: "scene", animationNaming: "body" }
const kiberaWeaponConfig: HeroWeaponConfig = { attachment: "scene", animationNaming: "body" }
const reinaWeaponConfig: HeroWeaponConfig = { hand: "left", rotation: { x: Math.PI / 2, y: 0, z: 0 } }
const reinaChristmasWeaponConfig: HeroWeaponConfig = { hand: "left", rotation: { x: 0, y: 0, z: 0 } }
const seriaSwordConfig: HeroWeaponConfig = { hand: "right" }
const seriaSheathConfig: HeroWeaponConfig = { hand: "left", animationNaming: "facialWeapon" }

export function getHeroWeaponConfig(modelFile: ModelFile): HeroWeaponConfig | undefined {
	// Seria draws the sword with her right hand while the left holds the
	// animated sheath. Costumes use both WeaponA/B and Weapon_A/B names.
	if (modelFile.path.startsWith("Seria/")) {
		if (modelFile.type === "weapona" || modelFile.type === "weapon_a") return seriaSwordConfig
		if (modelFile.type === "weaponb" || modelFile.type === "weapon_b") return seriaSheathConfig
	}
	// The blade follows the thumb side of Reina's grip (socket +Z), not
	// the finger direction. Christmas 2021 bakes in an extra X quarter-turn.
	if (modelFile.path.startsWith("Reina/") && weaponTypes.includes(modelFile.type)) {
		return modelFile.path.startsWith("Reina/Hero_Reina_Cos21Christmas_Weapon/")
			? reinaChristmasWeaponConfig
			: reinaWeaponConfig
	}
	// Kibera's single weapon FBX contains three blades with separate animated
	// hand/back sockets. Keep the rig in scene space and use its body-named clips.
	if (modelFile.path.startsWith("Kibera/") && weaponTypes.includes(modelFile.type)) {
		return kiberaWeaponConfig
	}
	// Nicky's chain bones animate in scene space, using the body's clip names.
	if (modelFile.path.startsWith("Nicky/") && weaponTypes.includes(modelFile.type)) {
		return nickyWeaponConfig
	}
	// Gremory has no hand sockets: her weapon's own animation positions it
	// alongside the body in the scene.
	if (modelFile.path.startsWith("Gremory/") && weaponTypes.includes(modelFile.type)) {
		return gremoryWeaponConfig
	}
	// Mediana's animated syringe rig uses the hand socket's axes directly.
	// Its exported bone inverses also need rebuilding in the FBX bind pose.
	if (modelFile.path.startsWith("Mediana/") && weaponTypes.includes(modelFile.type)) {
		return medianaWeaponConfig
	}
	// Isaiah draws the sword with her left hand; the animated sheath belongs
	// to the right socket and already uses its axes without the 90-degree turn.
	if (modelFile.path.startsWith("Isaiah/")) {
		if (modelFile.type === "weapon_a") return isaiahWeaponAConfig
		if (modelFile.type === "weapon_b") return isaiahWeaponBConfig
	}
	return undefined
}
