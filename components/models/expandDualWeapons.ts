import type { ModelFile } from "@/model/Hero_Model"

const dualWeaponHeroes = new Set(["Mitra", "Fluss", "Laudia", "Tanya", "Roi", "Shakmeh"])

export function expandDualWeapons(heroName: string, models: ModelFile[]): ModelFile[] {
	if (!dualWeaponHeroes.has(heroName)) return models
	// Most Fluss costumes already export distinct left/right swords.
	if (models.some((model) => model.type === "weapon_l" || model.type === "weapon_r")) return models
	const weapon = models.find((model) => model.type === "weapon")
	if (!weapon) return models

	// These heroes reuse a single rigid mesh in both hands. Separate model
	// entries give each instance its own transform and Parts toggle.
	return models.flatMap((model) =>
		model === weapon
			? [
					{ ...model, name: `${model.name}_r`, type: "weapon_r" as const },
					{ ...model, name: `${model.name}_l`, type: "weapon_l" as const },
				]
			: [model],
	)
}
