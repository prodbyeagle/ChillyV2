import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

/**
 * Represents a Discord slash command.
 */
export interface ICommand {
	name: string;
	description: string;
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| SlashCommandOptionsOnlyBuilder;
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Represents player data stored in the database.
 */
export interface IPlayerData {
	userid: string;
	username: string;
	currentlevel: number;
	experiencepoints: number;
	isbanned: boolean;
	banreason: string;
	warningcount: number;
	triviapoints: number;
	messagessent: number;
	levelupnotification: boolean;
	achievementnotification: boolean;
	robberyenabled: boolean;
	balance: number;
}

/**
 * Represents an in-game event (e.g., XP or money boost).
 */
export interface IEventData {
	id: string;
	type: 'xp' | 'money';
	multiplier: number;
	duration: string;
	timestamp: string;
}
