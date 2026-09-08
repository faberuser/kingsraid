import type { Object3D } from "three"
import type { ModelFile } from "@/model/Hero_Model"
import { weaponTypes } from "./types"

interface HeroWeaponConfig {
	recalculateBoneInverses?: boolean
	rotation?: { x: number; y: number; z: number }
	hand?: "left" | "right"
	socket?: string
	attachment?: "scene"
	animationNaming?: "body" | "facialWeapon" | "weaponPen"
}

const medianaWeaponConfig: HeroWeaponConfig = {
	recalculateBoneInverses: true,
	rotation: { x: 0, y: 0, z: 0 },
}

const leoBottleConfig: HeroWeaponConfig = { socket: "Bone_Inkbottle" }
const leoPenConfig: HeroWeaponConfig = { hand: "right", animationNaming: "weaponPen" }

const isaiahWeaponAConfig: HeroWeaponConfig = { hand: "left" }
const isaiahWeaponBConfig: HeroWeaponConfig = {
	hand: "right",
	rotation: { x: 0, y: 0, z: 0 },
}

const gremoryWeaponConfig: HeroWeaponConfig = { attachment: "scene" }
const nickyWeaponConfig: HeroWeaponConfig = { attachment: "scene", animationNaming: "body" }
const kiberaWeaponConfig: HeroWeaponConfig = { attachment: "scene", animationNaming: "body" }
const mirianneWeaponConfig: HeroWeaponConfig = { attachment: "scene" }
const shamillaAlternateWeaponConfig: HeroWeaponConfig = { hand: "left", rotation: { x: 0, y: 0, z: 0 } }
const reinaWeaponConfig: HeroWeaponConfig = { hand: "left", rotation: { x: Math.PI / 2, y: 0, z: 0 } }
const reinaChristmasWeaponConfig: HeroWeaponConfig = { hand: "left", rotation: { x: 0, y: 0, z: 0 } }
const seriaSwordConfig: HeroWeaponConfig = { hand: "right" }
const seriaSheathConfig: HeroWeaponConfig = { hand: "left", animationNaming: "facialWeapon" }
const swordConfig: HeroWeaponConfig = { hand: "right" }
// These animated sheath rigs already run along socket Z. The default X
// quarter-turn used for static swords would turn them across the grip.
const sheathConfig: HeroWeaponConfig = { hand: "left", rotation: { x: 0, y: 0, z: 0 } }

export function getHeroWeaponConfig(modelFile: ModelFile): HeroWeaponConfig | undefined {
	if (modelFile.path.startsWith("Leo/")) {
		if (modelFile.type === "weaponbottle" || modelFile.type === "weaponb") return leoBottleConfig
		if (modelFile.type === "weaponpen") return leoPenConfig
	}
	// All three blades have body-space motion in their _Weapon clips.
	// Handle is a separate accessory and must not use the blade rig's placement.
	if (modelFile.path.startsWith("Mirianne/") && modelFile.type === "weapon") {
		return mirianneWeaponConfig
	}
	// These exports omit the internal -90-degree X parent found in the
	// other Shamilla rigs, so they do not need the matching +90-degree turn.
	if (
		/^Shamilla\/Hero_Shamilla_(Cos19Casual|Cos20SL|Cos21Glory)_Weapon\//.test(modelFile.path) &&
		modelFile.type === "weapon"
	) {
		return shamillaAlternateWeaponConfig
	}
	// A/B names do not imply a hand to the viewer. These heroes draw with
	// the right hand while the left holds the separately animated sheath.
	if (modelFile.path.startsWith("Ripine/") || modelFile.path.startsWith("Riheet/")) {
		if (modelFile.type === "weapona" || modelFile.type === "weapon_a") return swordConfig
		if (modelFile.type === "weaponb" || modelFile.type === "weapon_b") return sheathConfig
	}
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

const sheathedWeaponBones: Record<string, string> = {
	Seria: "Point_Weapon",
	Isaiah: "Point_Weapon",
	Ripine: "Point_Weapon",
	// Despite its name, this bone controls the embedded sword grip, not the sheath.
	Riheet: "Point_SeathScale",
}

export function createWeaponVisibilitySync(modelFiles: ModelFile[], loadedModels: ReadonlyMap<string, Object3D>) {
	const swordFile = modelFiles.find(
		(file) =>
			Object.hasOwn(sheathedWeaponBones, file.path.split("/")[0]) &&
			(file.type === "weapona" || file.type === "weapon_a"),
	)
	if (!swordFile) return null
	const hero = swordFile.path.split("/")[0]
	const sheathFile = modelFiles.find(
		(file) => file.path.startsWith(`${hero}/`) && (file.type === "weaponb" || file.type === "weapon_b"),
	)
	if (!sheathFile) return null
	const sword = loadedModels.get(swordFile.name)
	const sheath = loadedModels.get(sheathFile.name)
	const embeddedSword = sheath?.getObjectByName(sheathedWeaponBones[hero])
	if (!sword || !sheath || !embeddedSword) return null

	return (visibleModels: ReadonlySet<string>, attachedWeapons: ReadonlySet<string>) => {
		if (!attachedWeapons.has(swordFile.name)) return
		// Weapon B includes the sheathed sword grip. Clips shrink its bone
		// below 0.01 when the separate hand-held sword should take over.
		const embeddedSwordShown =
			visibleModels.has(sheathFile.name) &&
			sheath.visible &&
			Math.max(
				Math.abs(embeddedSword.scale.x),
				Math.abs(embeddedSword.scale.y),
				Math.abs(embeddedSword.scale.z),
			) > 0.01
		sword.visible = visibleModels.has(swordFile.name) && !embeddedSwordShown
	}
}
