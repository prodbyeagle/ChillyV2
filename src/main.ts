import { config } from './config/config';
import { logMessage, readyEvent } from './events/ready';
import dotenv from 'dotenv';
import { EagleClient } from './client';
import { interactionCreateEvent } from './events/interaction';

dotenv.config();

const client = new EagleClient();

readyEvent(client);
interactionCreateEvent(client);

client.login(config.token).catch((err) => {
	logMessage(`Error logging in: ${err}`, 'error');
});
