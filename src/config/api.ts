import { Database } from './db';
import type { PlayerData, InventoryItem } from '../types';
import { Item } from '../logic/item';

const db = new Database();

export const api = {
	async getPlayer(name: string): Promise<PlayerData | null> {
		const data = await db.get<PlayerData>('players', { name });
		return data ? data[0] : null;
	},

	async updatePlayer(
		name: string,
		data: Partial<PlayerData>
	): Promise<boolean> {
		const existingPlayer = await this.getPlayer(name);
		if (existingPlayer) {
			return await db.patch('players', { name }, data);
		} else {
			return await this.createPlayer({ ...data, name } as PlayerData);
		}
	},

	async createPlayer(data: PlayerData): Promise<boolean> {
		return await db.post('players', data);
	},

	async getInventory(name: string): Promise<InventoryItem[] | null> {
		const data = await db.get<PlayerData>('players', { name });

		if (data && data[0] && data[0].inventory) {
			return Object.values(data[0].inventory);
		}

		return null;
	},

	async deletePlayer(name: string): Promise<boolean> {
		return db.delete('players', { name });
	},
};
