import assert from "node:assert/strict"
import test from "node:test"
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import Module from "node:module"
import ts from "typescript"
import * as THREE from "three"

const filename = fileURLToPath(new URL("../components/models/advanceAnimationFrame.ts", import.meta.url))
const compiled = new Module(filename)
compiled._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
	compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, filename)
const { advanceAnimationFrame } = compiled.exports

function player() {
	const parts = ["body", "hair", "weapon"].map((name) => {
		const root = new THREE.Object3D()
		return { name, root, mixer: new THREE.AnimationMixer(root), action: null }
	})
	const durations = [0.25, 0.5, 0.25]
	const transitions = []
	let sequence
	let index = 0
	function play(next) {
		index = next
		for (const part of parts) {
			part.mixer.stopAllAction()
			// Hair/weapon clips finish at different times; only the body drives transitions.
			const duration = part.name === "body" ? durations[index] : durations[index] / 2
			const clip = new THREE.AnimationClip(`Skill2-${index + 1}`, duration, [
				new THREE.NumberKeyframeTrack(".position[x]", [0, duration], [index * 10, index * 10 + 1]),
			])
			part.action = part.mixer.clipAction(clip)
			part.action.setLoop(THREE.LoopOnce, 1)
			part.action.clampWhenFinished = true
			part.action.play()
		}
		sequence = {
			action: parts[0].action,
			advance() {
				transitions.push((index + 1) % durations.length)
				play((index + 1) % durations.length)
			},
		}
	}
	play(0)
	return {
		parts, transitions,
		get index() { return index },
		frame(delta) {
			// Exercise the iterator used by Model, including repeated updates in one frame.
			const mixers = new Map(parts.map((p) => [p.name, p.mixer]))
			advanceAnimationFrame(mixers.values(), delta, () => sequence)
		},
	}
}

test("an exact body boundary starts every part of the next clip immediately", () => {
	const p = player()
	p.frame(0.25)
	assert.equal(p.index, 1)
	for (const part of p.parts) {
		assert.equal(part.action.time, 0)
		assert.equal(part.action.getEffectiveWeight(), 1)
		assert.equal(part.root.position.x, 10)
	}
})

test("unused frame time advances the next segment on every mixer", () => {
	const p = player()
	p.frame(0.3)
	assert.equal(p.index, 1)
	for (const part of p.parts) assert(Math.abs(part.action.time - 0.05) < 1e-10)
})

test("a long frame crosses multiple segments and loops without accumulated gaps", () => {
	const p = player()
	p.frame(1.125)
	assert.deepEqual(p.transitions, [1, 2, 0])
	assert.equal(p.index, 0)
	assert.equal(p.parts[0].action.time, 0.125)
})

test("shorter accessory clips do not advance the body sequence", () => {
	const p = player()
	p.frame(0.15)
	assert.deepEqual(p.transitions, [])
	assert.equal(p.parts[0].action.time, 0.15)
})

test("zero delta preserves playback and ordinary clips still loop", () => {
	const p = player()
	p.frame(0)
	assert.equal(p.parts[0].action.time, 0)
	assert.deepEqual(p.transitions, [])
	const root = new THREE.Object3D()
	const mixer = new THREE.AnimationMixer(root)
	const action = mixer.clipAction(new THREE.AnimationClip("Idle", 1, []))
	action.play()
	advanceAnimationFrame([mixer], 1.25, () => null)
	assert.equal(action.time, 0.25)
})
