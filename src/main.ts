import { config } from './config/config';
import { logMessage, readyEvent } from './events/ready';
import { ChillyRPGClient } from './client';
import { interactionCreateEvent } from './events/interaction';

require('dotenv').config();

const client = new ChillyRPGClient();

readyEvent(client);
interactionCreateEvent(client);

client.login(config.token).catch((err) => {
	logMessage(`Error logging in: ${err}`, 'error');
});
