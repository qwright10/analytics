import { AnalyticsClient } from './client/AnalyticsClient';
import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const client = new AnalyticsClient({
    token: process.env.token,
    owner: process.env.owner,
});
client.start();
