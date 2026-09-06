import { Badge } from "@/components/ui/badge"
import { getArtifactEffectTags } from "@/lib/artifact-tags"
import type { ArtifactData } from "@/model/Artifact"

export function ArtifactEffectBadges({ artifact }: { artifact: Pick<ArtifactData, "name"> }) {
	return (
		<div className="flex flex-wrap gap-2" aria-label="Artifact effects">
			{getArtifactEffectTags(artifact).map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	)
}
