import { Database } from './db';
import type { IEventData, IPlayerData } from 'types';
import { logMessage } from 'lib/utils';

const db = new Database();

export const Api = {
	/**
	 * Fetches a player's data by username.
	 * @param username - The username of the player.
	 * @returns The player's data or null if not found.
	 */
	async getPlayer(username: string): Promise<IPlayerData | null> {
		try {
			const data = await db.GET<IPlayerData>('players', { username });
			return data ? data[0] : null;
		} catch (error) {
			logMessage(
				`Error fetching player data for ${username}: ${JSON.stringify(
					error
				)}`,
				'error'
			);
			return null;
		}
	},

	async getAllPlayers(): Promise<IPlayerData[]> {
		try {
			return await db.GET<IPlayerData>('players', {});
		} catch (error) {
			logMessage(
				`Error fetching all players: ${JSON.stringify(error)}`,
				'error'
			);
			return [];
		}
	},

	/**
	 * Creates a new player entry in the database.
	 * @param data - The player data to be stored.
	 * @returns A boolean indicating success or failure.
	 */
	async createPlayer(data: IPlayerData): Promise<boolean> {
		try {
			return await db.POST('players', data);
		} catch (error) {
			logMessage(
				`Error creating player ${data.username}: ${JSON.stringify(
					error
				)}`,
				'error'
			);
			return false;
		}
	},

	/**
	 * Updates an existing player's data or creates a new player if not found.
	 * @param username - The player's username.
	 * @param id - The player's id. (Discord ID)
	 * @param data - The partial data to update.
	 * @returns A boolean indicating success or failure.
	 */
	async updatePlayer(
		username: string,
		id: string,
		data: Partial<IPlayerData>
	): Promise<boolean> {
		try {
			const existingPlayer = await this.getPlayer(username);

			if (existingPlayer) {
				return await db.PATCH('players', { username }, data);
			} else {
				const newPlayer: IPlayerData = {
					userid: id ?? '',
					username,
					currentlevel: data.currentlevel ?? 0,
					experiencepoints: data.experiencepoints ?? 0,
					isbanned: data.isbanned ?? false,
					banreason: data.banreason ?? '',
					warningcount: data.warningcount ?? 0,
					triviapoints: data.triviapoints ?? 0,
					messagessent: data.messagessent ?? 0,
					levelupnotification: data.levelupnotification ?? true,
					achievementnotification:
						data.achievementnotification ?? true,
					robberyenabled: data.robberyenabled ?? true,
					balance: data.balance ?? 0,
				};
				return await this.createPlayer(newPlayer);
			}
		} catch (error) {
			logMessage(
				`Error updating player ${username}: ${JSON.stringify(error)}`,
				'error'
			);
			return false;
		}
	},

	/**
	 * Deletes a player's data from the database.
	 * @param username - The username of the player.
	 * @returns A boolean indicating success or failure.
	 */
	async deletePlayer(username: string): Promise<boolean> {
		try {
			return await db.DELETE('players', { username });
		} catch (error) {
			logMessage(
				`Error deleting player ${username}: ${JSON.stringify(error)}`,
				'error'
			);
			return false;
		}
	},

	async getCurrentEvent(): Promise<IEventData | null> {
		try {
			const data = await db.GET<IEventData>('events', { active: true });
			return data && data.length > 0 ? data[0] : null;
		} catch (error) {
			logMessage(
				`Error fetching current event: ${JSON.stringify(error)}`,
				'error'
			);
			return null;
		}
	},

	async createEvent(eventData: IEventData): Promise<boolean> {
		try {
			const currentEvent = await this.getCurrentEvent();
			if (currentEvent) {
				logMessage(
					'An event is already active. Please end the current event before creating a new one.',
					'warn'
				);
				return false;
			}
			return await db.POST('events', { ...eventData, active: true });
		} catch (error) {
			logMessage(
				`Error creating event: ${JSON.stringify(error)}`,
				'error'
			);
			return false;
		}
	},

	async endEvent(): Promise<boolean> {
		try {
			const currentEvent = await this.getCurrentEvent();
			if (!currentEvent) {
				logMessage('No active event found to end.', 'warn');
				return false;
			}
			return await db.PATCH(
				'events',
				{ active: true },
				{ active: false }
			);
		} catch (error) {
			logMessage(`Error ending event: ${JSON.stringify(error)}`, 'error');
			return false;
		}
	},
};
