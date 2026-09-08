import type { ModelFile } from "@/model/Hero_Model"
import { weaponTypes } from "./types"

interface HeroWeaponConfig {
	recalculateBoneInverses?: boolean
	rotation?: { x: number; y: number; z: number }
	hand?: "left" | "right"
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

export function getHeroWeaponConfig(modelFile: ModelFile): HeroWeaponConfig | undefined {
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
