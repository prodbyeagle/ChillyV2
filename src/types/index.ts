import { SlashCommandBuilder } from 'discord.js';

export type Command = {
	name: string;
	description: string;
	data?: SlashCommandBuilder;
	execute: (interaction: any) => Promise<void>;
};

export interface PlayerData {
	name: string;
	gameStarted: boolean;
	level: number;
	masteryPoints: number;
	xp: number;
	gold: number;
	lastDailyClaim: number;
	lastWeeklyClaim: number;
	lastMonthlyClaim: number;
	messagesSent: number;
	clicks: number;
	petPoints: number;
	activePets: Record<string, any>;
	pets: Record<string, any>;
	inventory: Record<string, any>;
	masteries: Record<
		string,
		{
			name: string;
			description: string;
			maxLevel: number;
			currentLevel: number;
			cost: number;
		}
	>;
}
