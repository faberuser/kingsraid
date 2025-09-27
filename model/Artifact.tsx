export interface ArtifactData {
	description: string
	value: {
		[key: string]: string
	}
	thumbnail: string
	aliases?: string[] | null
}
