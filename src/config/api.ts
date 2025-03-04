import { Database } from './db';
import type { PlayerData, GameData } from '../types';
import { logMessage } from '../events/ready';

const db = new Database();

export const api = {
	async getPlayer(name: string): Promise<PlayerData | null> {
		try {
			const data = await db.GET<PlayerData>('players', { name });
			return data ? data[0] : null;
		} catch (error) {
			logMessage(
				`Error fetching player data for ${name}: ${JSON.stringify(
					error
				)}`,
				'error'
			);
			return null;
		}
	},

	async createPlayer(data: PlayerData): Promise<boolean> {
		if (!data.gameData) {
			data.gameData = {
				clicker: {
					clicks: 0,
					lastClickTimestamp: 0,
					streak: 0,
					multiplier: 1,
				},
			};
		}
		return await db.POST('players', data);
	},

	async updatePlayer(
		name: string,
		data: Partial<PlayerData>
	): Promise<boolean> {
		const existingPlayer = await this.getPlayer(name);
		if (existingPlayer) {
			return await db.PATCH('players', { name }, data);
		} else {
			return await this.createPlayer({ ...data, name } as PlayerData);
		}
	},

	async getGameData(name: string): Promise<GameData> {
		try {
			const player = await this.getPlayer(name);
			if (!player)
				return { clicker: { clicks: 0, streak: 0, multiplier: 1 } };

			if (!player.gameData) player.gameData = {};
			if (!player.gameData || !player.gameData.clicker) {
				player.gameData = {
					clicker: { clicks: 0, streak: 0, multiplier: 1 },
				};
			}

			return player.gameData;
		} catch (error) {
			logMessage(
				`Error fetching game data for ${name}: ${JSON.stringify(
					error
				)}`,
				'error'
			);
			return { clicker: { clicks: 0, streak: 0, multiplier: 1 } };
		}
	},

	async updateGameData(
		name: string,
		data: Partial<GameData>
	): Promise<boolean> {
		try {
			const player = await this.getPlayer(name);
			if (!player) return false;

			if (!player.gameData) player.gameData = {};
			if (!player.gameData) {
				player.gameData = {
					clicker: { clicks: 0, streak: 0, multiplier: 1 },
				};
			}

			player.gameData.clicker = {
				...player.gameData.clicker,
				...(data.clicker ?? {}),
			};

			return await this.updatePlayer(name, { gameData: player.gameData });
		} catch (error) {
			logMessage(
				`Error updating game data for ${name}: ${JSON.stringify(
					error
				)}`,
				'error'
			);
			return false;
		}
	},
	async deletePlayer(name: string): Promise<boolean> {
		return db.DELETE('players', { name });
	},
};
