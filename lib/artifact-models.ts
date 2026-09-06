import fs from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import type { ModelFile } from "@/model/Hero_Model"

const readManifest = cache(async (): Promise<Record<string, ModelFile[]>> => {
	try {
		const file = path.join(process.cwd(), "public/kingsraid-models/artifacts_manifest.json")
		const manifest: Record<string, ModelFile[]> = JSON.parse(await fs.readFile(file, "utf8"))
		return Object.fromEntries(Object.entries(manifest).map(([name, files]) => [normalizeName(name), files]))
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return {}
		throw error
	}
})

function normalizeName(name: string) {
	return name.trim().replace(/[‘’]/g, "'")
}

export async function getArtifactModels(name: string): Promise<ModelFile[]> {
	if (process.env.NEXT_PUBLIC_ENABLE_MODELS_VOICES !== "true") return []
	const manifest = await readManifest()
	return manifest[normalizeName(name)] ?? []
}
