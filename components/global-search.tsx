"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Search, Home, UserRound, Amphora, ShieldHalf, Zap, Calculator } from "lucide-react"
import { DialogTitle } from "@/components/ui/dialog"

// Types for search data
interface SearchItem {
	id: string
	title: string
	description?: string
	type: "page" | "hero" | "artifact" | "boss"
	url: string
	icon?: React.ComponentType<{ className?: string }>
}

// Page items
const pageItems: SearchItem[] = [
	{
		id: "home",
		title: "Home",
		description: "Welcome to King's Raid",
		type: "page",
		url: "/",
		icon: Home,
	},
	{
		id: "heroes",
		title: "Heroes",
		description: "Browse all heroes",
		type: "page",
		url: "/heroes",
		icon: UserRound,
	},
	{
		id: "artifacts",
		title: "Artifacts",
		description: "Browse all artifacts",
		type: "page",
		url: "/artifacts",
		icon: Amphora,
	},
	{
		id: "bosses",
		title: "Bosses",
		description: "Browse all bosses",
		type: "page",
		url: "/bosses",
		icon: ShieldHalf,
	},
	{
		id: "technomagic-gear",
		title: "Technomagic Gear",
		description: "Explore technomagic gear",
		type: "page",
		url: "/technomagic-gear",
		icon: Zap,
	},
	{
		id: "softcap",
		title: "Softcap",
		description: "Calculate softcap adjustments",
		type: "page",
		url: "/softcap",
		icon: Calculator,
	},
]

interface GlobalSearchProps {
	searchData?: {
		heroes?: Array<{ name: string; infos?: { class?: string; title?: string } }>
		artifacts?: Array<{ name: string; data?: { description?: string } }>
		bosses?: Array<{ infos?: { class?: string; title?: string; race?: string } }>
	}
}

export default function GlobalSearch({ searchData }: GlobalSearchProps) {
	const [open, setOpen] = useState(false)
	const [searchItems, setSearchItems] = useState<SearchItem[]>(pageItems)
	const [searchValue, setSearchValue] = useState("")
	const router = useRouter()
	const listRef = useRef<HTMLDivElement>(null)

	// Handle keyboard shortcut
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				setOpen((open) => !open)
			}
		}

		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [])

	// Build search items when searchData changes
	useEffect(() => {
		const items: SearchItem[] = [...pageItems]

		if (searchData?.heroes) {
			searchData.heroes.forEach((hero, index) => {
				items.push({
					id: `hero-${index}`,
					title: hero.name,
					description: `${hero.infos?.class || "Unknown"} - ${hero.infos?.title || "Hero"}`,
					type: "hero",
					url: `/heroes/${encodeURIComponent(hero.name)}`,
					icon: UserRound,
				})
			})
		}

		if (searchData?.artifacts) {
			searchData.artifacts.forEach((artifact, index) => {
				items.push({
					id: `artifact-${index}`,
					title: artifact.name,
					description: artifact.data?.description || "Artifact",
					type: "artifact",
					url: `/artifacts/${encodeURIComponent(artifact.name)}`,
					icon: Amphora,
				})
			})
		}

		if (searchData?.bosses) {
			searchData.bosses.forEach((boss, index) => {
				const bossName = boss.infos?.class || boss.infos?.title || `Boss ${index + 1}`
				items.push({
					id: `boss-${index}`,
					title: bossName,
					description: `${boss.infos?.title || boss.infos?.class || "Unknown"} - ${
						boss.infos?.race || "Boss"
					}`,
					type: "boss",
					url: `/bosses/${encodeURIComponent(bossName)}`,
					icon: ShieldHalf,
				})
			})
		}

		setSearchItems(items)
	}, [searchData])

	// Reset scroll position when search value changes
	useEffect(() => {
		if (open) {
			const timer = setTimeout(() => {
				const commandList = document.querySelector("[cmdk-list]") as HTMLElement
				if (commandList) {
					commandList.scrollTop = 0
				}
				if (listRef.current) {
					listRef.current.scrollTop = 0
				}
			}, 10)
			return () => clearTimeout(timer)
		}
	}, [searchValue, open])

	const handleSelect = (url: string) => {
		setOpen(false)
		setSearchValue("")
		router.push(url)
	}

	const getGroupTitle = (type: string) => {
		switch (type) {
			case "page":
				return "Pages"
			case "hero":
				return "Heroes"
			case "artifact":
				return "Artifacts"
			case "boss":
				return "Bosses"
			default:
				return "Results"
		}
	}

	// Group items by type
	const groupedItems = searchItems.reduce((acc, item) => {
		if (!acc[item.type]) {
			acc[item.type] = []
		}
		acc[item.type].push(item)
		return acc
	}, {} as Record<string, SearchItem[]>)

	// Handle dialog open/close
	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		if (!newOpen) {
			setSearchValue("")
		}
	}

	return (
		<>
			<Button
				variant="outline"
				className="w-full justify-start text-sm text-muted-foreground"
				onClick={() => setOpen(true)}
			>
				<Search className="mr-2 h-4 w-4" />
				Search...
				<kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
					<span className="text-xs">⌘</span>K
				</kbd>
			</Button>

			<CommandDialog open={open} onOpenChange={handleOpenChange}>
				<DialogTitle className="sr-only">Global Search</DialogTitle>
				<CommandInput placeholder="Search globally..." value={searchValue} onValueChange={setSearchValue} />
				<CommandList ref={listRef} className="max-h-[400px] overflow-y-auto custom-scrollbar">
					<CommandEmpty>No results found.</CommandEmpty>

					{Object.entries(groupedItems).map(([type, items]) => (
						<CommandGroup key={type} heading={getGroupTitle(type)}>
							{items.map((item) => {
								const Icon = item.icon
								return (
									<CommandItem
										key={item.id}
										value={`${item.title} ${item.description}`}
										onSelect={() => handleSelect(item.url)}
										className="flex items-center gap-2 px-2 py-1.5"
									>
										{Icon && <Icon className="h-4 w-4" />}
										<div className="flex flex-col">
											<span className="font-medium">{item.title}</span>
											{item.description && (
												<span className="text-xs text-muted-foreground">
													{item.description}
												</span>
											)}
										</div>
									</CommandItem>
								)
							})}
						</CommandGroup>
					))}
				</CommandList>
			</CommandDialog>
		</>
	)
}
