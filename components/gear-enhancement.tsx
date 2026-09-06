"use client"

import { Children, cloneElement, isValidElement, useId, useState, type ReactNode } from "react"
import { parseColoredText } from "@/lib/utils"

interface GearEnhancementProps {
	name: string
	description: string
	values?: Record<string, Record<string, string>>
}

export default function GearEnhancement({ name, description, values }: GearEnhancementProps) {
	const [level, setLevel] = useState("0")
	const groupName = useId()
	const hasValues = values && Object.keys(values).length > 0
	// Resolve placeholders after parsing colors so highlights also work inside colored text.
	const highlightValues = (nodes: ReactNode): ReactNode => Children.map(nodes, (node) => {
		if (typeof node === "string") {
			return node.split(/(\{\d+\})/g).map((part, index) => {
				const statKey = /^\{(\d+)\}$/.exec(part)?.[1]
				const value = statKey === undefined ? undefined : values?.[statKey]?.[level]
				if (value === undefined) return part
				return (
					<mark
						key={index}
						className="rounded bg-amber-100 px-1 font-bold tabular-nums text-amber-950 dark:bg-amber-400/20 dark:text-amber-200"
					>
						{value}
					</mark>
				)
			})
		}
		if (isValidElement<{ children?: ReactNode }>(node) && node.props.children !== undefined) {
			return cloneElement(node, undefined, highlightValues(node.props.children))
		}
		return node
	})

	return (
		<div className="mb-3 space-y-3">
			{hasValues && (
				<fieldset>
					<legend className="mb-2 text-sm font-medium text-muted-foreground">
						Enhancement<span className="sr-only"> for {name}</span>
					</legend>
					<div className="flex flex-wrap gap-1">
						{[0, 1, 2, 3, 4, 5].map((star) => (
							<label key={star} className="cursor-pointer">
								<input
									type="radio"
									name={groupName}
									value={star}
									checked={level === String(star)}
									onChange={(event) => setLevel(event.target.value)}
									aria-label={`${star} stars`}
									className="peer sr-only"
								/>
								<span className="flex h-9 min-w-10 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:hover:bg-primary/90 peer-checked:hover:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
									{star}★
								</span>
							</label>
						))}
					</div>
				</fieldset>
			)}
			<div aria-live="polite" aria-atomic="true">{highlightValues(parseColoredText(description))}</div>
		</div>
	)
}
