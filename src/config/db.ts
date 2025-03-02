import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';
import type { PlayerData } from '../types';

export class Database {
	private supabase: SupabaseClient;

	constructor() {
		this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
	}

	/**
	 * Fetches player data from the database.
	 * @param name - The player's name.
	 * @returns PlayerData object or null if not found.
	 */
	async getPlayerData(name: string): Promise<PlayerData | null> {
		try {
			const { data, error } = await this.supabase
				.from('players')
				.select('*')
				.eq('name', name)
				.single();

			if (error) {
				console.error(
					`Error fetching player data for ${name}:`,
					error.message
				);
				return null;
			}

			if (!data) {
				console.warn(`Player data not found for: ${name}`);
				return null;
			}

			return data;
		} catch (error) {
			console.error(
				`Unexpected error fetching player data for ${name}:`,
				error
			);
			return null;
		}
	}

	/**
	 * Creates a new player entry in the database.
	 * @param player - PlayerData object to insert.
	 * @returns Boolean indicating success.
	 */
	async createPlayer(player: PlayerData): Promise<boolean> {
		try {
			const { error } = await this.supabase
				.from('players')
				.insert(player);

			if (error) {
				console.error(
					`Error creating player ${player.name}:`,
					error.message
				);
				return false;
			}

			return true;
		} catch (error) {
			console.error(
				`Unexpected error creating player ${player.name}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Updates an existing player's data.
	 * @param name - Player's name.
	 * @param updates - Partial PlayerData object with fields to update.
	 * @returns Boolean indicating success.
	 */
	async updatePlayer(
		name: string,
		updates: Partial<PlayerData>
	): Promise<boolean> {
		try {
			if (Object.keys(updates).length === 0) {
				console.warn(`No updates provided for player: ${name}`);
				return false;
			}

			const { error } = await this.supabase
				.from('players')
				.update(updates)
				.eq('name', name);

			if (error) {
				console.error(`Error updating player ${name}:`, error.message);
				return false;
			}

			return true;
		} catch (error) {
			console.error(`Unexpected error updating player ${name}:`, error);
			return false;
		}
	}
}
