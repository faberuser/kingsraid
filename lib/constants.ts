export const DATA_VERSIONS = ["cbt-phase-2", "cbt-phase-1", "ccbt", "legacy"] as const
export type DataVersion = (typeof DATA_VERSIONS)[number]
