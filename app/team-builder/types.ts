import { HeroData } from "@/model/Hero"
import { ArtifactData } from "@/model/Artifact"

// Perk costs
export const PERK_COSTS = {
	t1: 10,
	t2: 15,
	t3: 15,
	t5: 15,
} as const

export const DEFAULT_MAX_POINTS = 80
export const MIN_POINTS = 80
export const MAX_POINTS = 95

export interface ClassPerksData {
	perks: {
		t1?: Record<string, string>
		t2?: Record<string, string>
	}
}

export interface SelectedPerks {
	t1: string[]
	t2: string[]
	t3: { skill: string; type: "light" | "dark" }[]
	t5: ("light" | "dark")[]
}

export interface TeamMember {
	hero: HeroData | null
	uw: boolean
	ut: string | null // "1", "2", "3", or "4"
	perks: SelectedPerks
	maxPoints: number
}

export interface TeamBuilderClientProps {
	heroesLegacy: HeroData[]
	heroesCcbt: HeroData[]
	heroesCbtPhase1: HeroData[]
	artifacts: ArtifactData[]
	saReverse: string[]
	classPerks: {
		general: ClassPerksData
		classes: Record<string, ClassPerksData>
	}
	heroClasses: Array<{
		value: string
		name: string
		icon: string
	}>
	releaseOrderLegacy: Record<string, string>
	releaseOrderCcbt: Record<string, string>
	releaseOrderCbtPhase1: Record<string, string>
}
