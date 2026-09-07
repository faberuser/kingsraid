import { FBXLoader } from "three-stdlib"
import { Mesh, type Group } from "three"
import { createFacialPlayer, installFacialMorphs, type FacialMetadata } from "./facialAnimation"

export async function loadFacialAnimation(model: Group, modelPath: string, metadataUrl: string, modelsUrl: string) {
	const response = await fetch(metadataUrl)
	if (!response.ok) throw new Error(`Facial metadata request failed: ${response.status}`)
	const metadata: FacialMetadata = await response.json()
	if (metadata.version !== 1) throw new Error("Unsupported facial metadata version")
	const name = modelPath
		.split("/")
		.pop()!
		.replace(/\.fbx$/i, "")
	const data = metadata.models[name]
	if (!data) return
	const paths = [...new Set(data.parts.map((part) => part.path).filter((path): path is string => !!path))]
	const sources = new Map(
		await Promise.all(
			paths.map(async (path) => {
				const source = await new FBXLoader().loadAsync(`${modelsUrl}/${path}`)
				return [path, source] as const
			}),
		),
	)
	try {
		for (const part of data.parts) {
			const target = model.getObjectByName(part.target)
			const source = part.path ? sources.get(part.path)?.getObjectByName(part.source) : undefined
			if (target instanceof Mesh && source instanceof Mesh && !installFacialMorphs(target, source)) {
				console.warn(`Facial mesh topology differs: ${name}/${part.target}; retaining costume geometry`)
			}
		}
		return createFacialPlayer(model, data, metadata)
	} finally {
		for (const source of sources.values()) {
			source.traverse((child) => {
				if (!(child instanceof Mesh)) return
				child.geometry.dispose()
				for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
					if ("map" in material) (material.map as { dispose(): void } | null)?.dispose()
					material.dispose()
				}
			})
		}
	}
}
