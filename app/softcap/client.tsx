"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SoftcapData {
	[statName: string]: {
		MaxK: number
		X1: number
		A1: number
		B1: number
		X2: number
		A2: number
		B2: number
		MinK: number
		X3: number
		A3: number
		B3: number
		X4: number
		A4: number
		B4: number
	}
}

interface SoftcapClientProps {
	softcapData: SoftcapData
}

// Helper functions for calculations
function attenuate(x: number, k: number, a: number, b: number): number {
	return Math.floor((k * 1000000) / (a * x * x + b * x + 1000000))
}

function attenuateInv(x: number, k: number, a: number, b: number): number {
	return k - Math.floor((k * 1000000) / (a * x * x + b * x + 1000000))
}

// Main calculation function matching the Python algorithm
function calculateActualStat(statType: SoftcapData[string], istat: number): string {
	let actual = 0

	if (istat === 0) {
		actual = 0
	} else if (istat > statType.X1) {
		actual = attenuateInv(istat, statType.MaxK, statType.A1, statType.B1)
	} else if (istat > statType.X2) {
		actual = Math.floor((istat * statType.A2) / 1000) + statType.B2
	} else if (istat < statType.X3) {
		actual = attenuateInv(istat, statType.MinK, statType.A3, statType.B3)
	} else if (istat < statType.X4) {
		actual = attenuate(istat, statType.MinK, statType.A4, statType.B4)
	} else {
		actual = istat
	}

	actual = Math.round(actual) / 10
	return Math.round(actual) + "%"
}

// Stat mappings based on your Python code
const statMappings = [
	{ name: "ACC", key: "acc" },
	{ name: "Crit", key: "crit" },
	{ name: "Attack Spd", key: "aspd" },
	{ name: "Lifesteal", key: "dodge" }, // Note: uses dodge data in Python
	{ name: "Penetration", key: "pen" },
	{ name: "Block DEF", key: "blockdef" },
	{ name: "CC Resist", key: "ccresist" },
	{ name: "Dodge", key: "dodge" },
	{ name: "Block", key: "dodge" }, // Note: uses dodge data in Python
	{ name: "Tough", key: "pen" }, // Note: uses pen data in Python
	{ name: "Crit Resist", key: "critresist" },
	{ name: "CC ACC", key: "ccacc" },
	{ name: "Mp/Atk", key: "mpatk" },
]

export default function SoftcapClient({ softcapData }: SoftcapClientProps) {
	const [inputValue, setInputValue] = useState<number>(1000)

	return (
		<div className="container mx-auto p-4 sm:p-8">
			<div className="space-y-4 mb-4">
				{/* Back Button */}
				<div className="mb-2">
					<Link href="/">
						<Button variant="ghost" className="gap-2 has-[>svg]:px-0 p-0">
							<ArrowLeft className="h-4 w-4" />
							Back to Home
						</Button>
					</Link>
				</div>

				<div className="flex flex-row gap-4 items-baseline">
					<div className="text-xl font-bold">Softcap</div>
				</div>
				<Separator />
			</div>

			{/* Input Section */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Enter Stat Value</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4 items-center">
						<Input
							type="number"
							value={inputValue}
							onChange={(e) => setInputValue(Number(e.target.value))}
							onFocus={(e) => e.target.select()}
							placeholder="Enter stat value"
							className="max-w-xs"
						/>
						<span className="text-sm text-muted-foreground">Enter a value to see softcap calculations</span>
					</div>
				</CardContent>
			</Card>

			{/* Softcap Table */}
			<Card>
				<CardHeader>
					<CardTitle>Softcap Table</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="text-left">Stat</TableHead>
								<TableHead className="text-right">Softcap</TableHead>
								<TableHead className="text-right">Value</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{statMappings.map((stat) => {
								const statData = softcapData[stat.key]
								if (!statData) return null

								const actualValue = calculateActualStat(statData, inputValue)

								return (
									<TableRow key={stat.name}>
										<TableCell className="font-medium">{stat.name}</TableCell>
										<TableCell className="text-right">{statData.X2}</TableCell>
										<TableCell className="text-right">{actualValue}</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
