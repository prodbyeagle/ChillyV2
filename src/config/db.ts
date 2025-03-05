import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';
import { logMessage } from 'events/ready';

/**
 * A database wrapper for performing basic CRUD operations using Supabase.
 */
export class Database {
	private supabase: SupabaseClient;

	/**
	 * Initializes the Supabase client with the provided configuration.
	 */
	constructor() {
		this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
	}

	/**
	 * Retrieves data from the specified table with optional filters.
	 *
	 * @param table - The name of the table from which to retrieve data.
	 * @param filters - Optional key-value pairs to filter the results.
	 * @returns A promise that resolves to an array of type T if successful, or null if an error occurs.
	 */
	async GET<T>(
		table: string,
		filters?: Record<string, any>
	): Promise<T[] | null> {
		try {
			let query = this.supabase.from(table).select('*');

			if (filters) {
				for (const [key, value] of Object.entries(filters)) {
					query = query.eq(key, value);
				}
			}

			const { data, error } = await query;
			if (error) {
				logMessage(`Error details: ${JSON.stringify(error)}`, 'error');
				throw error;
			}

			return data;
		} catch (err) {
			const error = err as Error;
			logMessage(
				`Error fetching data from ${table}: ${error.message}`,
				'error'
			);
			return null;
		}
	}

	/**
	 * Inserts data into the specified table.
	 *
	 * @param table - The name of the table into which to insert data.
	 * @param data - The data to insert.
	 * @returns A promise that resolves to true if the insertion was successful, or false otherwise.
	 */
	async POST<T>(table: string, data: T): Promise<boolean> {
		logMessage(`Inserting data into table: ${table}`, 'info');
		try {
			const { error } = await this.supabase.from(table).insert(data);
			if (error) throw error;

			logMessage(
				`Successfully inserted data into table: ${table}`,
				'info'
			);
			return true;
		} catch (err) {
			const error = err as Error;
			logMessage(
				`Error inserting data into ${table}: ${error.message}`,
				'error'
			);
			return false;
		}
	}

	/**
	 * Updates data in the specified table based on given filters.
	 *
	 * @param table - The name of the table to update.
	 * @param filters - Key-value pairs to filter the rows that will be updated.
	 * @param updates - Partial object containing the updates to apply.
	 * @returns A promise that resolves to true if the update was successful, or false otherwise.
	 */
	async PATCH<T>(
		table: string,
		filters: Record<string, any>,
		updates: Partial<T>
	): Promise<boolean> {
		logMessage(
			`Updating data in table: ${table} with filters: ${JSON.stringify(
				filters
			)}`,
			'info'
		);
		try {
			if (Object.keys(updates).length === 0) {
				logMessage(`No updates provided for table: ${table}`, 'warn');
				return false;
			}

			let query = this.supabase.from(table).update(updates);
			for (const [key, value] of Object.entries(filters)) {
				query = query.eq(key, value);
			}

			const { error } = await query;
			if (error) throw error;

			logMessage(`Successfully updated data in table: ${table}`, 'info');
			return true;
		} catch (err) {
			const error = err as Error;
			logMessage(
				`Error updating data in ${table}: ${error.message}`,
				'error'
			);
			return false;
		}
	}

	/**
	 * Deletes data from the specified table based on given filters.
	 *
	 * @param table - The name of the table from which to delete data.
	 * @param filters - Key-value pairs to filter the rows that will be deleted.
	 * @returns A promise that resolves to true if the deletion was successful, or false otherwise.
	 */
	async DELETE(
		table: string,
		filters: Record<string, any>
	): Promise<boolean> {
		logMessage(
			`Deleting data from table: ${table} with filters: ${JSON.stringify(
				filters
			)}`,
			'info'
		);
		try {
			let query = this.supabase.from(table).delete();
			for (const [key, value] of Object.entries(filters)) {
				query = query.eq(key, value);
			}

			const { error } = await query;
			if (error) throw error;

			logMessage(
				`Successfully deleted data from table: ${table}`,
				'info'
			);
			return true;
		} catch (err) {
			const error = err as Error;
			logMessage(
				`Error deleting data from ${table}: ${error.message}`,
				'error'
			);
			return false;
		}
	}
}
