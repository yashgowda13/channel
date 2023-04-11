import readlineSync from 'readline-sync';
import { config } from 'dotenv';
import crypto from '../modules/crypto.js';
import DB from '../modules/db.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: `${__dirname}/../.env` });

const mongo = new DB();

(async () => {
  const name = readlineSync.question('Name of the new Super User: ');

  const email = readlineSync.question('Email of the new Super User: ');

  const pass = readlineSync.question('Password of the new Super User: ', {
    hideEchoBack: true,
  });

  const saltHash = crypto.sash(pass);

  const doc = await mongo.createUser(name, email, { passHash: saltHash, superUser: true });

  if (doc && doc.err && doc.err.code === 11000) {
    console.log('That email already exists');
  } else if (doc.acknowledged) {
    console.log('Super User Created');
  } else {
    console.log('Error Occured');
    console.log(doc.err);
  }

  process.exit();
})();