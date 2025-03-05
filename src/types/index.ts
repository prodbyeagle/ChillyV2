import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export interface ICommand {
	name: string;
	description: string;
	data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

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
