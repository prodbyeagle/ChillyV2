import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Command } from './types';

export class ChillyRPGClient extends Client {
	public commands: Collection<string, Command> = new Collection();

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
