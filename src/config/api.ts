import { Database } from './db';
import type { IPlayerData } from 'types';
import { logMessage } from 'events/ready';

const db = new Database();

export const api = {
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
};
