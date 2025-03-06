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
	/** The name of the command. */
	name: string;
	/** A brief description of the command's functionality. */
	description: string;
	/** The command data including structure and options. */
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| SlashCommandOptionsOnlyBuilder;
	/** Optional autocomplete handler for command options. */
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
	/** The function executed when the command is triggered. */
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Represents player data stored in the database.
 */
export interface IPlayerData {
	/** Internal database ID (do not use, prefer `userid`). */
	id?: number;
	/** The unique Discord user ID of the player. */
	userid: string;
	/** The username of the player. */
	username: string;
	/** The current level of the player. */
	currentlevel: number;
	/** The total experience points accumulated by the player. */
	experiencepoints: number;
	/** Whether the player is banned. */
	isbanned: boolean;
	/** The reason for the player's ban, if applicable. */
	banreason: string;
	/** The number of warnings the player has received. */
	warningcount: number;
	/** The number of trivia points the player has earned. */
	triviapoints: number;
	/** The number of messages sent by the player. */
	messagessent: number;
	/** Whether level-up notifications are enabled for the player. */
	levelupnotification: boolean;
	/** Whether achievement notifications are enabled for the player. */
	achievementnotification: boolean;
	/** Whether the player has robbery actions enabled. */
	robberyenabled: boolean;
	/** The player's in-game currency balance. */
	balance: number;
}

/**
 * Represents an in-game event (e.g., XP or money boost).
 */
export interface IEventData {
	/** The type of event, either XP or money boost. */
	type: 'xp' | 'money';
	/** The multiplier applied during the event. */
	multiplier: number;
	/** The duration of the event (e.g., "30m", "2h"). */
	duration: string;
	/** The timestamp of when the event was created. */
	timestamp: string;
}
