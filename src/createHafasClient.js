import { createClient } from 'hafas-client';
import { profile as oebbProfile } from 'hafas-client/p/db/index.js';

// Set up Hafas client
const hafas = createClient(oebbProfile, 'mail@felixpirs.com');

export default hafas;