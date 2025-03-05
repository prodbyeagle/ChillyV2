import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

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

export interface IPlayerData {
	//? id is from supabase
	id?: number;
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

export interface IEventData {
	type: 'xp' | 'money';
	multiplier: number;
	duration: string;
	timestamp: string;
}
