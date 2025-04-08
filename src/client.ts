import type { ICommand } from 'types';

import { Client, Collection, GatewayIntentBits } from 'discord.js';

/**
 * Custom Discord client class for the ChillyBot.
 * Extends the base `Client` class from discord.js and adds additional functionality.
 */
export class ChillyClient extends Client {
	public commands: Collection<string, ICommand> = new Collection();

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMembers,
			],
		});
	}
}
