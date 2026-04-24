/**
 * Kings Raid Stats Generator
 *
 * Generates hero comparison JSON files for the /stats page.
 * Files are saved to /public/kingsraid-stats/{versionA}_vs_{versionB}/{HeroName}.json
 *
 * Usage:
 *   npx tsx scripts/generate-stats.ts
 *   npx tsx scripts/generate-stats.ts --pair legacy:ccbt
 *   npx tsx scripts/generate-stats.ts --pair legacy:ccbt --hero Annette
 *   npx tsx scripts/generate-stats.ts --force   (regenerate existing files)
 */

import fs from "node:fs"
import path from "node:path"

// ── Config ────────────────────────────────────────────────────────────────────

const TABLE_DATA = path.join(process.cwd(), "public", "kingsraid-data", "table-data")
const STATS_DIR = path.join(process.cwd(), "public", "kingsraid-stats")

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const FORCE = args.includes("--force")
const ONLY_PAIR = args.includes("--pair") ? args[args.indexOf("--pair") + 1] : null
const ONLY_HERO = args.includes("--hero") ? args[args.indexOf("--hero") + 1] : null

// ── Input types ───────────────────────────────────────────────────────────────

interface SkillEntry {
	name: string
	cost: string | null
	cooldown: string | null
	description: string
}

interface UWData {
	name: string
	description: string
	value: Record<string, Record<string, string>>
}

interface UTData {
	name: string
	description: string
	value: Record<string, Record<string, string>>
}

interface SWData {
	description: string
	cooldown: string
	uses: string
	advancement: Record<string, string>
}

interface HeroData {
	profile: { name: string; class: string; thumbnail: string }
	skills: Record<string, SkillEntry>
	books: Record<string, { II: string; III: string; IV: string }>
	perks: {
		t3: Record<string, { light?: { effect: string }; dark?: { effect: string } }>
		t5: { light: { effect: string }; dark: { effect: string } }
	}
	uw?: UWData
	uts?: Record<string, UTData>
	sw?: SWData
}

// ── Output format (consumed by client.tsx) ────────────────────────────────────

export type TextDiff = { from: string | null; to: string | null }

export interface HeroComparison {
	heroName: string
	versionA: string
	versionB: string
	generatedAt: string
	skills: Record<
		string,
		{
			hasChanges: boolean
			name?: TextDiff
			cooldown?: TextDiff
			mana_cost?: TextDiff
			description?: TextDiff
		}
	>
	books: Record<
		string,
		{
			skillName: string
			hasChanges: boolean
			II?: TextDiff
			III?: TextDiff
			IV?: TextDiff
		}
	>
	perks_t3: Record<
		string,
		{
			hasChanges: boolean
			light?: TextDiff
			dark?: TextDiff
		}
	>
	perks_t5?: {
		hasChanges: boolean
		light?: TextDiff
		dark?: TextDiff
	}
	uw?: {
		hasChanges: boolean
		description?: TextDiff
		values: Record<string, TextDiff>
	}
	uts: Record<
		string,
		{
			name: string
			hasChanges: boolean
			description?: TextDiff
			values: Record<string, TextDiff>
		}
	>
	sw?: {
		hasChanges: boolean
		description?: TextDiff
		cooldown?: TextDiff
		uses?: TextDiff
		advancement: Record<string, TextDiff>
	}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripColorCodes(text: string): string {
	return text.replace(/\[[0-9a-fA-F]{6}\]|\[-\]/g, "")
}

function stripAwakeningCoefficient(text: string): string {
	return text.replace(/\n+Awakening Coefficient\([^)]+\):[\s\S]*$/, "").trimEnd()
}

/** Clean text for storage: strip color codes and awakening footnotes. */
function cleanText(text: string): string {
	return stripAwakeningCoefficient(stripColorCodes(text)).trim()
}

/**
 * Normalize for equality comparison only.
 * Collapses operator whitespace and replaces both legacy ??? and CBT awakening
 * formulas with a common token so they never register as a diff.
 */
function normalizeDesc(text: string): string {
	const collapsed = stripAwakeningCoefficient(stripColorCodes(text))
		.replace(/\s*\+\s*/g, "+")
		.replace(/\s*-\s*/g, "-")
	return collapsed.replace(/[\d.]+\*\(0\.7\+\(0\.3\*Skill Level\*Awakening Coefficient\)\)\+[\d.]+/g, "???")
}

/** Extract sorted numeric values from text. Used to detect pure wording-only changes. */
function extractNumbers(text: string): string {
	return (text.match(/\d+(?:\.\d+)?/g) ?? []).sort().join(",")
}

function hasNumericChange(a: string, b: string): boolean {
	return extractNumbers(a) !== extractNumbers(b)
}

function tierValues(valueMap: Record<string, string>): string {
	return Object.values(valueMap).join(" / ")
}

function readJson<T>(filePath: string): T | null {
	try {
		if (!fs.existsSync(filePath)) return null
		return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T
	} catch {
		return null
	}
}

function getVersions(): string[] {
	const desc = readJson<{ data_versions: Record<string, unknown> }>(path.join(TABLE_DATA, "description.json"))
	return desc ? Object.keys(desc.data_versions) : ["cbt-phase-2", "cbt-phase-1", "ccbt", "legacy"]
}

function loadHeroes(version: string): Record<string, HeroData> {
	const dir = path.join(TABLE_DATA, version, "heroes")
	if (!fs.existsSync(dir)) return {}
	const result: Record<string, HeroData> = {}
	for (const file of fs.readdirSync(dir)) {
		if (!file.endsWith(".json")) continue
		const data = readJson<HeroData>(path.join(dir, file))
		if (data) result[file.replace(".json", "")] = data
	}
	return result
}

// ── Comparison builder ────────────────────────────────────────────────────────

function buildComparison(
	heroName: string,
	fromHero: HeroData,
	toHero: HeroData,
	versionA: string,
	versionB: string,
): HeroComparison | null {
	const comp: HeroComparison = {
		heroName,
		versionA,
		versionB,
		generatedAt: new Date().toISOString(),
		skills: {},
		books: {},
		perks_t3: {},
		uts: {},
	}

	// ── Skills ─────────────────────────────────────────────────────────────────

	for (const slot of Object.keys(fromHero.skills ?? {})) {
		const fs = fromHero.skills[slot]
		const ts = toHero.skills?.[slot]
		if (!fs || !ts) continue

		const nameChanged = fs.name !== ts.name
		const cooldownChanged = fs.cooldown !== ts.cooldown
		const costChanged = fs.cost !== ts.cost
		// Use normalizeDesc for comparison (collapses formula/whitespace differences)
		const descChanged = normalizeDesc(fs.description) !== normalizeDesc(ts.description)

		if (nameChanged || cooldownChanged || costChanged || descChanged) {
			comp.skills[slot] = {
				hasChanges: true,
				...(nameChanged ? { name: { from: fs.name, to: ts.name } } : {}),
				...(cooldownChanged ? { cooldown: { from: fs.cooldown ?? null, to: ts.cooldown ?? null } } : {}),
				...(costChanged ? { mana_cost: { from: fs.cost ?? null, to: ts.cost ?? null } } : {}),
				...(descChanged
					? { description: { from: cleanText(fs.description), to: cleanText(ts.description) } }
					: {}),
			}
		}
	}

	// ── Books ──────────────────────────────────────────────────────────────────
	// Only include book entries where numbers actually changed (skip pure wording rewrites)

	for (const slot of Object.keys(fromHero.books ?? {})) {
		const fb = fromHero.books[slot]
		const tb = toHero.books?.[slot]
		if (!fb || !tb) continue

		const diffs: { II?: TextDiff; III?: TextDiff; IV?: TextDiff } = {}
		for (const level of ["II", "III", "IV"] as const) {
			const fv = stripColorCodes(fb[level] ?? "")
			const tv = stripColorCodes(tb[level] ?? "")
			if (fv !== tv && fv && tv && hasNumericChange(fv, tv)) {
				diffs[level] = { from: fv, to: tv }
			}
		}
		if (diffs.II || diffs.III || diffs.IV) {
			comp.books[slot] = {
				skillName: fromHero.skills?.[slot]?.name ?? `Skill ${slot}`,
				hasChanges: true,
				...diffs,
			}
		}
	}

	// ── Perks T3 ───────────────────────────────────────────────────────────────
	// Only include if numbers changed

	for (const slot of Object.keys(fromHero.perks?.t3 ?? {})) {
		const fp = fromHero.perks.t3[slot]
		const tp = toHero.perks?.t3?.[slot]
		if (!fp || !tp) continue

		const fl = stripColorCodes(fp.light?.effect ?? "")
		const tl = stripColorCodes(tp.light?.effect ?? "")
		const fd = stripColorCodes(fp.dark?.effect ?? "")
		const td = stripColorCodes(tp.dark?.effect ?? "")

		const lightDiff = fl !== tl && fl && tl && hasNumericChange(fl, tl) ? { from: fl, to: tl } : undefined
		const darkDiff = fd !== td && fd && td && hasNumericChange(fd, td) ? { from: fd, to: td } : undefined

		if (lightDiff || darkDiff) {
			comp.perks_t3[slot] = {
				hasChanges: true,
				...(lightDiff ? { light: lightDiff } : {}),
				...(darkDiff ? { dark: darkDiff } : {}),
			}
		}
	}

	// ── Perks T5 ───────────────────────────────────────────────────────────────

	if (fromHero.perks?.t5 && toHero.perks?.t5) {
		const fl = stripColorCodes(fromHero.perks.t5.light?.effect ?? "")
		const tl = stripColorCodes(toHero.perks.t5.light?.effect ?? "")
		const fd = stripColorCodes(fromHero.perks.t5.dark?.effect ?? "")
		const td = stripColorCodes(toHero.perks.t5.dark?.effect ?? "")

		const lightDiff = fl !== tl && hasNumericChange(fl, tl) ? { from: fl, to: tl } : undefined
		const darkDiff = fd !== td && hasNumericChange(fd, td) ? { from: fd, to: td } : undefined

		if (lightDiff || darkDiff) {
			comp.perks_t5 = {
				hasChanges: true,
				...(lightDiff ? { light: lightDiff } : {}),
				...(darkDiff ? { dark: darkDiff } : {}),
			}
		}
	}

	// ── UW ────────────────────────────────────────────────────────────────────

	if (fromHero.uw && toHero.uw) {
		const fd = cleanText(fromHero.uw.description)
		const td = cleanText(toHero.uw.description)
		const descDiff = fd !== td ? { from: fd, to: td } : undefined

		const values: Record<string, TextDiff> = {}
		for (const param of Object.keys(fromHero.uw.value ?? {})) {
			const fv = tierValues(fromHero.uw.value[param] ?? {})
			const tv = tierValues(toHero.uw.value?.[param] ?? {})
			if (fv !== tv) values[param] = { from: fv, to: tv }
		}

		if (descDiff || Object.keys(values).length > 0) {
			comp.uw = { hasChanges: true, ...(descDiff ? { description: descDiff } : {}), values }
		}
	}

	// ── UTs ───────────────────────────────────────────────────────────────────

	for (const slot of Object.keys(fromHero.uts ?? {})) {
		const fut = fromHero.uts![slot]
		const tut = toHero.uts?.[slot]
		if (!fut || !tut) continue

		const fd = cleanText(fut.description)
		const td = cleanText(tut.description)
		const descDiff = fd !== td ? { from: fd, to: td } : undefined

		const values: Record<string, TextDiff> = {}
		for (const param of Object.keys(fut.value ?? {})) {
			const fv = tierValues(fut.value[param] ?? {})
			const tv = tierValues(tut.value?.[param] ?? {})
			if (fv !== tv) values[param] = { from: fv, to: tv }
		}

		if (descDiff || Object.keys(values).length > 0) {
			comp.uts[slot] = {
				name: fut.name,
				hasChanges: true,
				...(descDiff ? { description: descDiff } : {}),
				values,
			}
		}
	}

	// ── SW ────────────────────────────────────────────────────────────────────

	if (fromHero.sw && toHero.sw) {
		const fd = cleanText(fromHero.sw.description)
		const td = cleanText(toHero.sw.description)
		const descDiff = fd !== td ? { from: fd, to: td } : undefined
		const cooldownChanged = fromHero.sw.cooldown !== toHero.sw.cooldown
		const usesChanged = fromHero.sw.uses !== toHero.sw.uses

		const advancement: Record<string, TextDiff> = {}
		for (const key of Object.keys(fromHero.sw.advancement ?? {})) {
			const fv = stripColorCodes(fromHero.sw.advancement[key] ?? "")
			const tv = stripColorCodes(toHero.sw.advancement?.[key] ?? "")
			if (fv !== tv && fv && tv) advancement[key] = { from: fv, to: tv }
		}

		if (descDiff || cooldownChanged || usesChanged || Object.keys(advancement).length > 0) {
			comp.sw = {
				hasChanges: true,
				...(descDiff ? { description: descDiff } : {}),
				...(cooldownChanged ? { cooldown: { from: fromHero.sw.cooldown, to: toHero.sw.cooldown } } : {}),
				...(usesChanged ? { uses: { from: fromHero.sw.uses, to: toHero.sw.uses } } : {}),
				advancement,
			}
		}
	}

	// ── Return null if nothing changed ─────────────────────────────────────────

	const hasContent =
		Object.keys(comp.skills).length > 0 ||
		Object.keys(comp.books).length > 0 ||
		Object.keys(comp.perks_t3).length > 0 ||
		comp.perks_t5 ||
		comp.uw ||
		Object.keys(comp.uts).length > 0 ||
		comp.sw

	return hasContent ? comp : null
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
	console.log("🎮 Kings Raid Stats Generator")
	console.log("================================")
	if (FORCE) console.log("⚡ Force mode: regenerating existing files")
	if (ONLY_PAIR) console.log(`🔍 Only pair: ${ONLY_PAIR}`)
	if (ONLY_HERO) console.log(`🦸 Only hero: ${ONLY_HERO}`)

	const versions = getVersions()
	console.log(`\nVersions: ${versions.join(", ")}`)

	let pairs: Array<[string, string]> = []
	for (const va of versions) {
		for (const vb of versions) {
			if (va !== vb) pairs.push([va, vb])
		}
	}

	if (ONLY_PAIR) {
		const [a, b] = ONLY_PAIR.split(":")
		pairs = pairs.filter(([va, vb]) => va === a && vb === b)
		if (pairs.length === 0) {
			console.error(`No matching pair found for "${ONLY_PAIR}"`)
			process.exit(1)
		}
	}

	let totalGenerated = 0
	let totalSkipped = 0
	let totalNoChanges = 0

	for (const [versionA, versionB] of pairs) {
		console.log(`\n📊 ${versionA} → ${versionB}`)

		const fromHeroes = loadHeroes(versionA)
		const toHeroes = loadHeroes(versionB)
		let heroNames = Object.keys(fromHeroes).filter((name) => toHeroes[name])

		if (ONLY_HERO) heroNames = heroNames.filter((n) => n === ONLY_HERO)
		console.log(`  ${heroNames.length} heroes in common`)

		const outDir = path.join(STATS_DIR, `${versionA}_vs_${versionB}`)
		fs.mkdirSync(outDir, { recursive: true })

		for (const heroName of heroNames) {
			const outFile = path.join(outDir, `${heroName}.json`)

			if (!FORCE && fs.existsSync(outFile)) {
				totalSkipped++
				continue
			}

			process.stdout.write(`  ${heroName}...`)

			try {
				const comparison = buildComparison(
					heroName,
					fromHeroes[heroName],
					toHeroes[heroName],
					versionA,
					versionB,
				)
				if (comparison) {
					fs.writeFileSync(outFile, JSON.stringify(comparison, null, 2))
					console.log(" ✓")
					totalGenerated++
				} else {
					console.log(" – no changes")
					totalNoChanges++
				}
			} catch (err) {
				console.log(` ✗ ${err}`)
			}
		}
	}

	console.log(`\n✅ Done!`)
	console.log(`   Generated : ${totalGenerated}`)
	console.log(`   No changes: ${totalNoChanges}`)
	console.log(`   Skipped   : ${totalSkipped}`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})

// ── CLI args ──────────────────────────────────────────────────────────────────
