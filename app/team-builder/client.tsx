"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { HeroData } from "@/model/Hero"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Share2, Check, Trash2 } from "lucide-react"
import { useDataVersion } from "@/hooks/use-data-version"
import { useHeroToggle } from "@/contexts/version-toggle-context"
import Fuse from "fuse.js"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"

import { TeamMember, TeamBuilderClientProps, PERK_COSTS, MIN_POINTS, MAX_POINTS } from "./types"
import { createEmptyMember, calculateUsedPoints, encodeTeam, decodeTeam, extractVersionFromEncoded } from "./utils"
import { HeroCard, EmptySlot, HeroSelectDialog } from "@/components/team-builder"
import { ArtifactData } from "@/model/Artifact"

function TeamBuilderContent({
	heroesLegacy,
	heroesCcbt,
	heroesCbtPhase1,
	artifacts,
	artifactReleaseOrder,
	classPerks,
	heroClasses,
	releaseOrderLegacy,
	releaseOrderCcbt,
	releaseOrderCbtPhase1,
}: Omit<TeamBuilderClientProps, "saReverse">) {
	const { version: dataVersion, setVersionDirect } = useDataVersion()
	const { setShowToggle, setAvailableVersions } = useHeroToggle()
	const searchParams = useSearchParams()
	const router = useRouter()

	// Enable version toggle on mount
	useEffect(() => {
		setShowToggle(true)
		setAvailableVersions(["cbt-phase-1", "ccbt", "legacy"])
		return () => setShowToggle(false)
	}, [setShowToggle, setAvailableVersions])

	// Get heroes and release order based on data version
	const heroes = useMemo(() => {
		switch (dataVersion) {
			case "cbt-phase-1":
				return heroesCbtPhase1
			case "ccbt":
				return heroesCcbt
			default:
				return heroesLegacy
		}
	}, [dataVersion, heroesLegacy, heroesCcbt, heroesCbtPhase1])

	const releaseOrder = useMemo(() => {
		switch (dataVersion) {
			case "cbt-phase-1":
				return releaseOrderCbtPhase1
			case "ccbt":
				return releaseOrderCcbt
			default:
				return releaseOrderLegacy
		}
	}, [dataVersion, releaseOrderLegacy, releaseOrderCcbt, releaseOrderCbtPhase1])

	// Helper function to get heroes by version
	const getHeroesByVersion = useCallback(
		(version: string) => {
			switch (version) {
				case "cbt-phase-1":
					return heroesCbtPhase1
				case "ccbt":
					return heroesCcbt
				default:
					return heroesLegacy
			}
		},
		[heroesLegacy, heroesCcbt, heroesCbtPhase1],
	)

	// Initialize team from URL or empty (localStorage loaded in effect below)
	const [team, setTeam] = useState<TeamMember[]>(() => {
		// First try URL params (works on both server and client)
		const encoded = searchParams.get("t")
		if (encoded) {
			// Extract version from URL to use correct hero list
			const urlVersion = extractVersionFromEncoded(encoded) ?? "legacy"
			const heroesForVersion =
				urlVersion === "cbt-phase-1" ? heroesCbtPhase1 : urlVersion === "ccbt" ? heroesCcbt : heroesLegacy
			const result = decodeTeam(encoded, heroesForVersion)
			if (result) {
				const decodedTeam = result.team
				while (decodedTeam.length < 8) {
					decodedTeam.push(createEmptyMember())
				}
				return decodedTeam.slice(0, 8)
			}
		}
		return Array(8)
			.fill(null)
			.map(() => createEmptyMember())
	})

	// Ref to track current team for effects that need fresh value without re-running
	const teamRef = useRef(team)
	useEffect(() => {
		teamRef.current = team
	}, [team])

	// Load team from localStorage on mount (client-side only)
	const [initialLoadDone, setInitialLoadDone] = useState(false)

	// Listen for version switch events from the context (team was cleared)
	useEffect(() => {
		const handleTeamCleared = () => {
			setTeam(
				Array(8)
					.fill(null)
					.map(() => createEmptyMember()),
			)
			router.replace("/team-builder", { scroll: false })
		}

		window.addEventListener("team-cleared-by-version-switch", handleTeamCleared)
		return () => window.removeEventListener("team-cleared-by-version-switch", handleTeamCleared)
	}, [router])

	// Track if URL has been handled to avoid re-processing
	const urlHandledRef = useRef(false)

	// Set version from URL on mount and re-decode team with correct heroes
	useEffect(() => {
		if (urlHandledRef.current) return

		const encoded = searchParams.get("t")
		if (!encoded) {
			urlHandledRef.current = true
			return
		}

		const urlVersion = extractVersionFromEncoded(encoded)
		if (urlVersion) {
			urlHandledRef.current = true

			// Always set version from URL (direct, bypass team check)
			setVersionDirect(urlVersion as "cbt-phase-1" | "ccbt" | "legacy")

			// Re-decode team with correct heroes list to ensure consistency
			const heroesForVersion = getHeroesByVersion(urlVersion)
			const result = decodeTeam(encoded, heroesForVersion)
			if (result) {
				const decodedTeam = result.team
				while (decodedTeam.length < 8) {
					decodedTeam.push(createEmptyMember())
				}
				setTeam(decodedTeam.slice(0, 8))
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Only run on mount

	useEffect(() => {
		if (initialLoadDone) return

		const encoded = searchParams.get("t")
		if (encoded) {
			// Already loaded from URL param
			setInitialLoadDone(true)
			return
		}

		// Try localStorage
		const saved = localStorage.getItem("team-builder-team")
		if (saved) {
			try {
				const parsed = JSON.parse(saved)
				// Rehydrate hero and artifact references from their names
				// Try all hero lists to find matches
				const allHeroes = [...heroesLegacy, ...heroesCcbt, ...heroesCbtPhase1]
				const rehydrated = parsed.map((member: TeamMember & { heroName?: string; artifactName?: string }) => {
					let hero = null
					let artifact = null

					if (member.heroName) {
						hero = allHeroes.find((h) => h.profile.name === member.heroName) || null
					}

					if (member.artifactName) {
						artifact = artifacts.find((a) => a.name === member.artifactName) || null
					}

					return {
						...member,
						hero,
						artifact,
						heroName: undefined,
						artifactName: undefined,
					}
				})
				while (rehydrated.length < 8) {
					rehydrated.push(createEmptyMember())
				}
				setTeam(rehydrated.slice(0, 8))
			} catch {
				// Invalid saved data, ignore
			}
		}
		setInitialLoadDone(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
	const [heroSearchQuery, setHeroSearchQuery] = useState("")
	const [copied, setCopied] = useState(false)
	const [heroDialogOpen, setHeroDialogOpen] = useState(false)
	const [perksDialogOpen, setPerksDialogOpen] = useState(false)

	// Filtering and sorting state - synced with Heroes page via localStorage
	const [selectedClass, setSelectedClass] = useState("all")
	const [selectedDamageType, setSelectedDamageType] = useState("all")
	const [sortType, setSortType] = useState<"alphabetical" | "release">(() => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("heroesSortType")
			if (stored === "alphabetical" || stored === "release") return stored
		}
		return "release"
	})
	const [reverseSort, setReverseSort] = useState(() => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("heroesReverseSort")
			if (stored !== null) return stored === "true"
		}
		return true
	})
	const [sortMounted, setSortMounted] = useState(false)

	// Mark as mounted after initial render
	useEffect(() => {
		setSortMounted(true)
	}, [])

	// Save filter/sort preferences to localStorage when changed (synced with Heroes page)
	useEffect(() => {
		if (sortMounted && typeof window !== "undefined") {
			localStorage.setItem("heroesSortType", sortType)
			localStorage.setItem("heroesReverseSort", reverseSort.toString())
		}
	}, [sortType, reverseSort, sortMounted])

	// Track if user has explicitly cleared the team (to distinguish from version switch clearing)
	const [userCleared, setUserCleared] = useState(false)

	// Save team to localStorage whenever it changes (only after initial load)
	useEffect(() => {
		if (!initialLoadDone) return

		if (typeof window !== "undefined") {
			const hasContent = team.some((m) => m.hero !== null)
			if (hasContent) {
				// Store hero names and artifact names instead of full objects to avoid serialization issues
				const toSave = team.map((member) => ({
					...member,
					hero: null,
					heroName: member.hero?.profile.name || null,
					artifact: null,
					artifactName: member.artifact?.name || null,
				}))
				localStorage.setItem("team-builder-team", JSON.stringify(toSave))
				setUserCleared(false)
			} else if (userCleared) {
				// Only remove from localStorage if user explicitly cleared
				localStorage.removeItem("team-builder-team")
			}
		}
	}, [team, userCleared, initialLoadDone])

	// Note: We intentionally do NOT re-decode from URL when version/heroes changes
	// because the URL encoding is version-specific (uses hero indices).
	// The team is preserved in state and localStorage, which use hero names.
	// This is only needed if we want to support version switching while keeping URL valid,
	// which we don't - the URL is for sharing, not for version switching.

	// Sync URL with team after initial load (for localStorage loaded teams)
	useEffect(() => {
		if (!initialLoadDone) return

		const hasUrlParam = searchParams.get("t")
		const hasContent = team.some((m) => m.hero !== null)
		// If team loaded from localStorage (no URL param but has content), update URL
		if (!hasUrlParam && hasContent) {
			const encoded = encodeTeam(team, heroes, dataVersion)
			router.replace(`/team-builder?t=${encoded}`, { scroll: false })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialLoadDone])

	// Fuse search for heroes
	const fuse = useMemo(() => {
		return new Fuse(heroes, {
			keys: ["profile.name", "profile.title", "aliases"],
			threshold: 0.3,
		})
	}, [heroes])

	const filteredHeroes = useMemo(() => {
		let result = heroes

		// Apply search filter
		if (heroSearchQuery.trim()) {
			const searchResults = fuse.search(heroSearchQuery)
			result = searchResults.map((item) => item.item)
		}

		// Apply class filter
		if (selectedClass !== "all") {
			result = result.filter((hero) => hero.profile?.class?.toLowerCase() === selectedClass.toLowerCase())
		}

		// Apply damage type filter
		if (selectedDamageType !== "all") {
			result = result.filter(
				(hero) => hero.profile?.damage_type?.toLowerCase() === selectedDamageType.toLowerCase(),
			)
		}

		// Sort by selected sort type
		if (sortType === "release") {
			result = [...result].sort((a, b) => {
				const aOrder = parseInt(releaseOrder[a.profile.name] ?? "9999", 10)
				const bOrder = parseInt(releaseOrder[b.profile.name] ?? "9999", 10)
				return aOrder - bOrder
			})
		} else {
			result = [...result].sort((a, b) => a.profile.name.localeCompare(b.profile.name))
		}

		// Reverse if needed
		if (reverseSort) {
			result = result.reverse()
		}

		return result
	}, [heroes, heroSearchQuery, fuse, selectedClass, selectedDamageType, sortType, reverseSort, releaseOrder])

	// Update URL when team changes
	const updateURL = useCallback(
		(newTeam: TeamMember[]) => {
			const hasContent = newTeam.some((m) => m.hero !== null)
			if (hasContent) {
				const encoded = encodeTeam(newTeam, heroes, dataVersion)
				router.replace(`/team-builder?t=${encoded}`, { scroll: false })
			} else {
				router.replace("/team-builder", { scroll: false })
			}
		},
		[router, heroes, dataVersion],
	)

	// Select hero for slot (supports multi-select by finding next empty slot)
	const selectHero = (hero: HeroData) => {
		const newTeam = [...team]

		// Find the first empty slot
		const emptySlotIndex = newTeam.findIndex((m) => m.hero === null)
		if (emptySlotIndex === -1) {
			// No empty slots available, close dialog
			setHeroDialogOpen(false)
			setHeroSearchQuery("")
			return
		}

		newTeam[emptySlotIndex] = {
			...createEmptyMember(),
			hero,
		}
		setTeam(newTeam)
		updateURL(newTeam)

		// Check if all slots are now filled
		const nextEmptySlot = newTeam.findIndex((m) => m.hero === null)
		if (nextEmptySlot === -1) {
			// All slots filled, close dialog
			setHeroDialogOpen(false)
			setHeroSearchQuery("")
		}
		// Otherwise keep dialog open for more selections
	}

	// Remove hero from slot
	const removeHero = (slot: number) => {
		const newTeam = [...team]
		newTeam[slot] = createEmptyMember()
		setTeam(newTeam)
		updateURL(newTeam)
	}

	// Toggle UW
	const toggleUW = (slot: number) => {
		const newTeam = [...team]
		newTeam[slot] = {
			...newTeam[slot],
			uw: !newTeam[slot].uw,
		}
		setTeam(newTeam)
		updateURL(newTeam)
	}

	// Select UT
	const selectUT = (slot: number, ut: string | null) => {
		const newTeam = [...team]
		newTeam[slot] = {
			...newTeam[slot],
			ut: newTeam[slot].ut === ut ? null : ut,
		}
		setTeam(newTeam)
		updateURL(newTeam)
	}

	// Select Artifact
	const selectArtifact = (slot: number, artifact: ArtifactData | null) => {
		const newTeam = [...team]
		newTeam[slot] = {
			...newTeam[slot],
			artifact,
		}
		setTeam(newTeam)
		updateURL(newTeam)
	}

	// Update max points
	const updateMaxPoints = (slot: number, points: number) => {
		const newTeam = [...team]
		newTeam[slot] = {
			...newTeam[slot],
			maxPoints: Math.max(MIN_POINTS, Math.min(MAX_POINTS, points)),
		}
		setTeam(newTeam)
		updateURL(newTeam)
	}

	// Toggle perk
	const togglePerk = (slot: number, tier: "t1" | "t2" | "t3" | "t5", perkId: string, subType?: "light" | "dark") => {
		const newTeam = [...team]
		const member = newTeam[slot]
		const currentPerks = { ...member.perks }
		const usedPoints = calculateUsedPoints(currentPerks)
		const cost = PERK_COSTS[tier]

		if (tier === "t1") {
			const index = currentPerks.t1.indexOf(perkId)
			if (index >= 0) {
				currentPerks.t1 = currentPerks.t1.filter((p) => p !== perkId)
			} else if (usedPoints + cost <= member.maxPoints) {
				currentPerks.t1 = [...currentPerks.t1, perkId]
			}
		} else if (tier === "t2") {
			const index = currentPerks.t2.indexOf(perkId)
			if (index >= 0) {
				currentPerks.t2 = currentPerks.t2.filter((p) => p !== perkId)
			} else if (usedPoints + cost <= member.maxPoints) {
				currentPerks.t2 = [...currentPerks.t2, perkId]
			}
		} else if (tier === "t3" && subType) {
			const existing = currentPerks.t3.find((p) => p.skill === perkId && p.type === subType)
			if (existing) {
				currentPerks.t3 = currentPerks.t3.filter((p) => !(p.skill === perkId && p.type === subType))
			} else if (usedPoints + cost <= member.maxPoints) {
				// Remove opposite type if selected
				currentPerks.t3 = currentPerks.t3.filter((p) => p.skill !== perkId)
				currentPerks.t3 = [...currentPerks.t3, { skill: perkId, type: subType }]
			}
		} else if (tier === "t5" && subType) {
			const index = currentPerks.t5.indexOf(subType)
			if (index >= 0) {
				currentPerks.t5 = currentPerks.t5.filter((p) => p !== subType)
			} else if (usedPoints + cost <= member.maxPoints) {
				currentPerks.t5 = [...currentPerks.t5, subType]
			}
		}

		newTeam[slot] = {
			...member,
			perks: currentPerks,
		}
		setTeam(newTeam)
		updateURL(newTeam)
	}

	// Copy share link
	const copyShareLink = async () => {
		const url = window.location.href
		await navigator.clipboard.writeText(url)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	// Clear all
	const clearAll = () => {
		const newTeam = Array(8)
			.fill(null)
			.map(() => createEmptyMember())
		setUserCleared(true) // Mark as user-initiated clear
		setTeam(newTeam)
		router.replace("/team-builder", { scroll: false })
	}

	// Get T1 perks (general)
	const t1Perks = classPerks.general.perks.t1 || {}

	// Get T2 perks for a hero's class
	const getT2Perks = (heroClass: string) => {
		const classData = classPerks.classes[heroClass.toLowerCase()]
		return classData?.perks.t2 || {}
	}

	// Get active team members count
	const activeCount = team.filter((m) => m.hero !== null).length

	// Drag and drop state
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

	// Handle drag start
	const handleDragStart = (index: number) => {
		setDraggedIndex(index)
	}

	// Handle drag over
	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault()
		if (draggedIndex !== null && draggedIndex !== index) {
			setDragOverIndex(index)
		}
	}

	// Handle drag leave
	const handleDragLeave = () => {
		setDragOverIndex(null)
	}

	// Handle drop - swap positions
	const handleDrop = (targetIndex: number) => {
		if (draggedIndex !== null && draggedIndex !== targetIndex) {
			const newTeam = [...team]
			// Swap the two positions
			const temp = newTeam[draggedIndex]
			newTeam[draggedIndex] = newTeam[targetIndex]
			newTeam[targetIndex] = temp
			setTeam(newTeam)
			updateURL(newTeam)
		}
		setDraggedIndex(null)
		setDragOverIndex(null)
	}

	// Handle drag end
	const handleDragEnd = () => {
		setDraggedIndex(null)
		setDragOverIndex(null)
	}

	// Handle hero dialog state
	const handleOpenHeroDialog = (slot: number) => {
		setSelectedSlot(slot)
		setHeroDialogOpen(true)
	}

	// Handle perks dialog state
	const handlePerksDialogChange = (open: boolean, slot: number) => {
		setPerksDialogOpen(open)
		if (open) setSelectedSlot(slot)
	}

	return (
		<TooltipProvider>
			<div>
				{/* Header */}
				<div className="space-y-4 mb-4">
					<div className="flex flex-row justify-between items-center">
						<div className="flex flex-row gap-2 items-baseline">
							<div className="text-xl font-bold">Team Builder</div>
							<div className="text-muted-foreground text-sm">{activeCount} / 8 heroes</div>
						</div>
						<div className="flex gap-2">
							<Button variant="outline" onClick={copyShareLink} disabled={activeCount === 0}>
								{copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
								{copied ? "Copied!" : "Share"}
							</Button>
							<Button variant="destructive" onClick={clearAll} disabled={activeCount === 0}>
								<Trash2 className="h-4 w-4" />
								Clear
							</Button>
						</div>
					</div>

					<Separator />
				</div>

				{/* Team Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{team.map((member, index) =>
						member.hero ? (
							<HeroCard
								key={index}
								member={member}
								index={index}
								perksDialogOpen={perksDialogOpen}
								selectedSlot={selectedSlot}
								artifacts={artifacts}
								artifactReleaseOrder={artifactReleaseOrder}
								onRemove={removeHero}
								onToggleUW={toggleUW}
								onSelectUT={selectUT}
								onSelectArtifact={selectArtifact}
								onPerksDialogChange={handlePerksDialogChange}
								onPerkToggle={togglePerk}
								onMaxPointsUpdate={updateMaxPoints}
								t1Perks={t1Perks}
								getT2Perks={getT2Perks}
								isDragging={draggedIndex === index}
								isDragOver={dragOverIndex === index}
								onDragStart={handleDragStart}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								onDragEnd={handleDragEnd}
							/>
						) : (
							<EmptySlot
								key={index}
								index={index}
								onOpenDialog={handleOpenHeroDialog}
								isDragOver={dragOverIndex === index}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
							/>
						),
					)}
				</div>

				{/* Hero Select Dialog - rendered at parent level to persist across slot changes */}
				<HeroSelectDialog
					isOpen={heroDialogOpen}
					onOpenChange={(open) => {
						setHeroDialogOpen(open)
						if (!open) setHeroSearchQuery("")
					}}
					heroSearchQuery={heroSearchQuery}
					onSearchChange={setHeroSearchQuery}
					filteredHeroes={filteredHeroes}
					team={team}
					onSelectHero={selectHero}
					heroClasses={heroClasses}
					selectedClass={selectedClass}
					onClassChange={setSelectedClass}
					selectedDamageType={selectedDamageType}
					onDamageTypeChange={setSelectedDamageType}
					sortType={sortType}
					onSortTypeChange={setSortType}
					reverseSort={reverseSort}
					onReverseSortChange={setReverseSort}
				/>
			</div>
		</TooltipProvider>
	)
}

export default function TeamBuilderClient(props: TeamBuilderClientProps) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<TeamBuilderContent {...props} />
		</Suspense>
	)
}
