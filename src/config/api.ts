import { Database } from './db';
import type { PlayerData, InventoryItem } from '../types';
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

	async createPlayer(data: PlayerData): Promise<boolean> {
		return await db.POST('players', data);
	},

	async getInventory(name: string): Promise<InventoryItem[] | null> {
		const data = await db.GET<PlayerData>('players', { name });

		if (data && data[0] && data[0].inventory) {
			return Object.values(data[0].inventory);
		}

		return null;
	},

	async deletePlayer(name: string): Promise<boolean> {
		return db.DELETE('players', { name });
	},
};
