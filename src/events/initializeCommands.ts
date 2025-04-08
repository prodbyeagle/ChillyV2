import { config } from 'config/config';

import type { ICommand } from 'types';

import { ChillyClient } from 'client';

import { banCommand } from 'commands/admin/ban';
import { clearChannelCommand } from 'commands/admin/clearchannel';
import { lockCommand } from 'commands/admin/lock';
import { unbanCommand } from 'commands/admin/unban';
import { unlockCommand } from 'commands/admin/unlock';
import { warnCommand } from 'commands/admin/warn';
import { eventCommand } from 'commands/event';
import { robCommand } from 'commands/fun/rob';
import { triviaCommand } from 'commands/fun/trivia';
import { leaderboardCommand } from 'commands/leaderboard';
import { profileCommand } from 'commands/profile';
import { remindMeCommand } from 'commands/remindme';
import { settingsCommand } from 'commands/settings';

import { REST, Routes } from 'discord.js';

import { logMessage } from 'lib/utils';

export const initializeCommands = async (client: ChillyClient) => {
	const rest = new REST({ version: '10' }).setToken(config.token);

	const commands = new Map<string, ICommand>();

	const allCommands: ICommand[] = [
		profileCommand,
		eventCommand,
		robCommand,
		leaderboardCommand,
		banCommand,
		unbanCommand,
		lockCommand,
		unlockCommand,
		warnCommand,
		remindMeCommand,
		triviaCommand,
		clearChannelCommand,
		settingsCommand,
	];

	for (const command of allCommands) {
		commands.set(command.name, command);
		client.commands.set(command.name, command);
	}

	try {
		await rest.put(Routes.applicationCommands(client.user.id), {
			body: Array.from(commands.values()).map((command) =>
				command.data.toJSON()
			),
		});
		logMessage('Commands successfully registered.', 'info');
	} catch (error) {
		logMessage(
			`Error while refreshing commands: ${
				error instanceof Error ? error.message : String(error)
			}`,
			'error'
		);
	}
};
