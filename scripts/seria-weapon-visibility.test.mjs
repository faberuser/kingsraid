import assert from "node:assert/strict"
import test from "node:test"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Module, { createRequire } from "node:module"
import ts from "typescript"
import { Object3D } from "three"

function loadTypeScript(filename) {
	const compiled = new Module(filename)
	compiled.require = (specifier) => specifier.startsWith(".")
		? loadTypeScript(path.resolve(path.dirname(filename), `${specifier}.ts`))
		: createRequire(filename)(specifier)
	compiled._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
		compilerOptions: { module: ts.ModuleKind.CommonJS },
	}).outputText, filename)
	return compiled.exports
}
const { createWeaponVisibilitySync } = loadTypeScript(
	fileURLToPath(new URL("../components/models/heroWeaponConfig.ts", import.meta.url)),
)

function setup(hero = "Seria", underscored = false) {
	const sword = new Object3D()
	const sheath = new Object3D()
	const bone = new Object3D()
	bone.name = hero === "Riheet" ? "Point_SeathScale" : "Point_Weapon"
	sheath.add(bone)
	const files = [
		{ name: "sword", path: `${hero}/sword.fbx`, type: underscored ? "weapon_a" : "weapona" },
		{ name: "sheath", path: `${hero}/sheath.fbx`, type: underscored ? "weapon_b" : "weaponb" },
	]
	const sync = createWeaponVisibilitySync(files, new Map([["sword", sword], ["sheath", sheath]]))
	return { sword, sheath, bone, sync }
}

test("animated sheathing and drawing show only one sword for both costume naming styles", () => {
	for (const hero of ["Seria", "Isaiah", "Ripine", "Riheet"]) for (const underscored of [false, true]) {
		const { sword, bone, sync } = setup(hero, underscored)
		const visible = new Set(["sword", "sheath"])
		const attached = new Set(["sword", "sheath"])
		for (const scale of [1, 0.5, 0.001, 0.001, 1]) {
			bone.scale.setScalar(scale)
			sync(visible, attached)
			assert.equal(sword.visible, scale <= 0.01)
		}
		assert.deepEqual([...visible], ["sword", "sheath"], "animation must not change toggle selection")
	}
})

test("manual toggles and hidden sheath restore the standalone sword without advancing animation", () => {
	for (const hero of ["Seria", "Isaiah", "Ripine", "Riheet"]) {
		const { sword, sheath, bone, sync } = setup(hero)
		const attached = new Set(["sword", "sheath"])
		sync(new Set(["sword"]), attached)
		assert.equal(sword.visible, true)
		bone.scale.setScalar(0.001)
		sync(new Set(["sheath"]), attached)
		assert.equal(sword.visible, false)
		bone.scale.setScalar(1)
		sheath.visible = false
		sync(new Set(["sword", "sheath"]), attached)
		assert.equal(sword.visible, true)
	}
})

test("unattached swords stay hidden and other heroes are unaffected", () => {
	const { sword, sync } = setup()
	sword.visible = false
	sync(new Set(["sword"]), new Set())
	assert.equal(sword.visible, false)
	assert.equal(setup("Reina").sync, null)
})
