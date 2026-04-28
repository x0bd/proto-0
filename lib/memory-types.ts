export type MemorySource = "chat" | "voice" | "ritual" | "system";

export interface MemoryEntry {
	id: string;
	content: string;
	tags: string[];
	source: MemorySource;
	date: string;
	dateLabel?: string;
}

export type MemoryItem = MemoryEntry;

export interface MemoryPolicy {
	readEnabled: boolean;
	writeEnabled: boolean;
	retentionLimit: number;
	allowedSources: MemorySource[];
}

export const DEFAULT_MEMORY_POLICY: MemoryPolicy = {
	readEnabled: true,
	writeEnabled: true,
	retentionLimit: 200,
	allowedSources: ["chat", "voice", "ritual", "system"],
};
