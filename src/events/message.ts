import { Events, Message } from 'discord.js';
import { ChillyClient } from '../client';
import { logMessage } from './ready';
import { api } from '../config/api';
import type { IPlayerData } from '../types';

/**
 * Tracks messages sent in the server and updates the player's stats.
 */
export const messageEvent = (client: ChillyClient) => {
	client.on(Events.MessageCreate, async (message: Message) => {
		if (message.author.bot) return;

		const username = message.author.username;
		const userid = message.author.id;
		try {
			let playerData: IPlayerData | null = await api.getPlayer(username);

			if (!playerData) {
				playerData = {
					userid,
					username,
					currentlevel: 0,
					experiencepoints: 0,
					isbanned: false,
					banreason: '',
					warningcount: 0,
					triviapoints: 0,
					messagessent: 0,
					levelupnotification: true,
					achievementnotification: true,
					robberyenabled: true,
					balance: 0,
				};
			}

			//TODO: when multiplier are implemented (weekend bonus for example) then add it here
			playerData.messagessent += 1;
			playerData.balance += 2;
			playerData.experiencepoints += 2;

			await api.updatePlayer(username, userid, {
				messagessent: playerData.messagessent,
				balance: playerData.balance,
				experiencepoints: playerData.experiencepoints,
			});
		} catch (error) {
			logMessage(
				`Error updating message count for ${username}: ${error}`,
				'error'
			);
		}
	});
};
