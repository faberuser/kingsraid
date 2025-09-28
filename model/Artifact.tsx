export interface ArtifactData {
	name: string
	description: string
	value: {
		[key: string]: string
	}
	thumbnail: string
	story: string
	aliases?: string[] | null
}
