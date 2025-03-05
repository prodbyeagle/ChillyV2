import { Events, Message } from 'discord.js';
import { ChillyClient } from '../client';
import { logMessage } from './ready';
import { Api } from '../config/api';
import type { IPlayerData } from '../types';

/**
 * Tracks messages sent in the server and updates the player's stats.
 * Applies event multipliers if an active event exists and removes expired events.
 */
export const messageEvent = (client: ChillyClient) => {
	client.on(Events.MessageCreate, async (message: Message) => {
		if (message.author.bot) return;

		const username = message.author.username;
		const userid = message.author.id;

		try {
			let playerData: IPlayerData | null = await Api.getPlayer(username);

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

			if (playerData.isbanned) return;

			const balanceGain = Math.floor(Math.random() * 5) + 1;
			const xpGain = Math.floor(Math.random() * 5) + 1;

			const activeEvent = await Api.getCurrentEvent();

			if (activeEvent) {
				const eventStartTime = parseInt(activeEvent.timestamp);
				const eventDurationMs =
					Number(activeEvent.duration) * 60 * 1000;
				const eventEndTime = eventStartTime + eventDurationMs;
				const currentTime = Date.now();

				if (currentTime >= eventEndTime) {
					await Api.endEvent();
				} else {
					if (activeEvent.type === 'xp') {
						playerData.experiencepoints +=
							xpGain * activeEvent.multiplier;
					} else if (activeEvent.type === 'money') {
						playerData.balance +=
							balanceGain * activeEvent.multiplier;
					}
				}
			} else {
				playerData.experiencepoints += xpGain;
				playerData.balance += balanceGain;
			}

			playerData.messagessent += 1;

			await Api.updatePlayer(username, userid, {
				messagessent: playerData.messagessent,
				balance: playerData.balance,
				experiencepoints: playerData.experiencepoints,
			});
		} catch (error) {
			logMessage(
				`Error updating message stats for ${username}: ${JSON.stringify(
					error
				)}`,
				'error'
			);
		}
	});
};
