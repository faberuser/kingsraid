import nameDiffData from "../../public/kingsraid-models/name_diff.json"
import hairFallbackData from "../../public/kingsraid-models/hair_fallback.json"
import weaponFallbackData from "../../public/kingsraid-models/weapon_fallback.json"
import defaultPositionData from "../../public/kingsraid-models/weapon_defaultpos.json"
import dualWeaponData from "../../public/kingsraid-models/dual_weapon_heroes.json"
import weaponConfigData from "../../public/kingsraid-models/hero_weapon_config.json"

// Shared configuration entry point for server discovery and the browser viewer.
// Static imports load once and keep filesystem APIs out of the client bundle.
export const nameDiff: Readonly<Record<string, string>> = nameDiffData
export const hairFallback: Readonly<Record<string, string>> = hairFallbackData
export const weaponFallback: Readonly<Record<string, string | string[]>> = weaponFallbackData
export const defaultPosHeroes: readonly string[] = defaultPositionData
export const dualWeaponHeroNames: readonly string[] = dualWeaponData
export { weaponConfigData }
