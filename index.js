import express, { urlencoded, json } from 'express';
import cors from 'cors';
import mongo from './modules/db.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import MailJet from 'node-mailjet';
import crypto from './modules/crypto.js'

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import auth from "./routes/auth.js"
import users from "./routes/admin/users.js"
import channels from "./routes/channels.js"
import posts from "./routes/posts.js"

const routes = { admin: {} };

routes.auth = auth
routes.admin.users = users
routes.channels = channels
routes.posts = posts

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

global.__dirname = __dirname;


dotenv.config();

const mailjet = new MailJet.Client({
  apiKey: process.env.MAILJET_API,
  apiSecret: process.env.MAILJET_SECRET
});

global.jwt = jwt
global.mailjet = mailjet

global.crypto = crypto;

global.dbase = new mongo();

const PORT = 5000;

const app = express();

app.use(cors({ credentials: true, origin: 'http://localhost:4200' }));

app.use(cookieParser());

app.use(express.static('dist'));

app.use(urlencoded({ extended: true }));
app.use(json());

app.use(routes.auth);
app.use(routes.channels);
app.use(routes.posts);
app.use(routes.admin.users);

//TEST API
app.post('/api/test', (req, res) => {
	res.status(200).send('Test OK');
});

app.get('*', (req, res) => {
	res.sendFile(__dirname + '/dist/index.html');
});

app.listen(PORT, () => {
	console.log(`App Listening to PORT: ${PORT}`);
});

