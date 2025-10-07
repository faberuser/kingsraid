import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface TechnomagicGear {
	name: string
	colour: [number, number, number]
	classes: {
		[className: string]: string
	}
}

interface TechnomagicGearClientProps {
	gears: TechnomagicGear[]
}

const classColors = {
	Knight: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	Warrior: "bg-red-500/10 text-red-600 dark:text-red-400",
	Assassin: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
	Archer: "bg-green-500/10 text-green-600 dark:text-green-400",
	Mechanic: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
	Wizard: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
	Priest: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
}

export default function TechnomagicGearClient({ gears }: TechnomagicGearClientProps) {
	return (
		<div>
			<div className="space-y-4 mb-4">
				<div className="flex flex-row gap-4 items-baseline">
					<div className="text-xl font-bold">Technomagic Gear</div>
					<div className="text-muted-foreground text-sm">Showing {gears.length} gears</div>
				</div>

				<Separator />
			</div>

			{/* Gear Cards */}
			<div className="grid gap-6">
				{gears.map((gear) => (
					<Card key={gear.name} className="overflow-hidden">
						<CardHeader>
							<div className="flex items-center gap-3">
								{/* Color indicator */}
								<div
									className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
									style={{ backgroundColor: `rgb(${gear.colour.join(",")})` }}
								/>
								<CardTitle className="text-xl">{gear.name}</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Object.entries(gear.classes).map(([className, effect]) => (
									<div key={className} className="space-y-2">
										<div className="flex items-center gap-2">
											<Badge
												variant="secondary"
												className={
													classColors[className as keyof typeof classColors] ||
													"bg-gray-500/10 text-gray-600 dark:text-gray-400"
												}
											>
												{className}
											</Badge>
										</div>
										<div className="text-sm text-muted-foreground leading-relaxed pl-2 border-l-2 border-gray-200 dark:border-gray-700">
											{effect}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
