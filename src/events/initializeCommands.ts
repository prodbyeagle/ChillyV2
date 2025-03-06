/* eslint-disable @typescript-eslint/no-explicit-any */
import { REST, Routes } from 'discord.js';
import { config } from 'config/config';
import { ChillyClient } from 'client';
import { logMessage } from 'lib/utils';

import { profileCommand } from 'commands/profile';
import { eventCommand } from 'commands/event';
import { robCommand } from 'commands/fun/rob';
import { leaderboardCommand } from 'commands/leaderboard';
import { banCommand } from 'commands/admin/ban';
import { unbanCommand } from 'commands/admin/unban';
import { lockCommand } from 'commands/admin/lock';
import { unlockCommand } from 'commands/admin/unlock';
import { warnCommand } from 'commands/admin/warn';
import { remindMeCommand } from 'commands/remindme';
import { triviaCommand } from 'commands/fun/trivia';

/**
 * Initializes and registers all commands for the bot.
 */
export const initializeCommands = async (client: ChillyClient) => {
	const rest = new REST({ version: '10' }).setToken(config.token);

	const commands = new Map<string, any>();

	commands.set(profileCommand.name, profileCommand);
	commands.set(eventCommand.name, eventCommand);
	commands.set(robCommand.name, robCommand);
	commands.set(leaderboardCommand.name, leaderboardCommand);
	commands.set(banCommand.name, banCommand);
	commands.set(unbanCommand.name, unbanCommand);
	commands.set(lockCommand.name, lockCommand);
	commands.set(unlockCommand.name, unlockCommand);
	commands.set(warnCommand.name, warnCommand);
	commands.set(remindMeCommand.name, remindMeCommand);
	commands.set(triviaCommand.name, triviaCommand);

	client.commands.set(profileCommand.name, profileCommand);
	client.commands.set(eventCommand.name, eventCommand);
	client.commands.set(robCommand.name, robCommand);
	client.commands.set(leaderboardCommand.name, leaderboardCommand);
	client.commands.set(banCommand.name, banCommand);
	client.commands.set(unbanCommand.name, unbanCommand);
	client.commands.set(lockCommand.name, lockCommand);
	client.commands.set(unlockCommand.name, unlockCommand);
	client.commands.set(warnCommand.name, warnCommand);
	client.commands.set(remindMeCommand.name, remindMeCommand);
	client.commands.set(triviaCommand.name, triviaCommand);

	try {
		await rest.put(Routes.applicationCommands(client.user.id), {
			body: Array.from(commands.values()).map((command) =>
				command.data.toJSON()
			),
		});
		logMessage('Commands successfully registered.', 'info');
	} catch (error) {
		logMessage(
			`Error while refreshing commands: ${error.message}`,
			'error'
		);
	}
};
