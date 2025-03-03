import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';
import { logMessage } from '../events/ready';

export class Database {
	private supabase: SupabaseClient;

	constructor() {
		this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
	}

	async get<T>(
		table: string,
		filters?: Record<string, any>
	): Promise<T[] | null> {
		logMessage(
			`Fetching data from table: ${table} with filters: ${JSON.stringify(
				filters
			)}`,
			'info'
		);
		try {
			let query = this.supabase.from(table).select('*');

			if (filters) {
				for (const [key, value] of Object.entries(filters)) {
					query = query.eq(key, value);
				}
			}

			const { data, error } = await query;
			if (error) throw error;

			logMessage(
				`Successfully fetched data from table: ${table}`,
				'info'
			);
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

	async post<T>(table: string, data: T): Promise<boolean> {
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

	async patch<T>(
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

	async delete(
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
