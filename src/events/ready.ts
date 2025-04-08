import { ChillyClient } from 'client';

import { Events } from 'discord.js';

import { logMessage } from 'lib/utils';

import { initializeCommands } from './initializeCommands';

/**
 * Handles the `ClientReady` event.
 * This event is triggered when the bot has successfully logged in and is ready to use.
 * It initializes the bot commands and logs the status.
 *
 * @param client - The ChillyClient instance that emits this event.
 */
export const readyEvent = (client: ChillyClient) => {
	client.on(Events.ClientReady, async () => {
		if (client.user) {
			try {
				initializeCommands(client);
				logMessage(
					'Bot is ready and commands are initialized.',
					'info'
				);
			} catch (error) {
				logMessage(
					`Error during bot initialization: ${error.message}`,
					'error'
				);
			}
		} else {
			logMessage('Client user is undefined. Unable to log in.', 'warn');
		}
	});
};
