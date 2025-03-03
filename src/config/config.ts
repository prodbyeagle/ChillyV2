require('dotenv').config();

export const config = {
	token: process.env.BOT_TOKEN || 'discord_bot_key',
	supabaseUrl: process.env.SUPABASE_URL || 'supabase_key',
	supabaseKey: process.env.ANON_KEY || 'anon_key',
};
