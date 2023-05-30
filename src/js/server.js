import koaBody from 'koa-body';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Router from '@koa/router';
import Koa from 'koa';
import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import uploadDir from './utils/uploadDir';
import getMessagesSlice from './routes/message/utils/messagesSlice';
import { newMessage } from './db/messages';
import favouritesRouter from './routes/favourites/index';
import searchRouter from './routes/search/index';
import filesRouter from './routes/files/index';
import ioRouter from './routes/io/index';
import messagesRouter from './routes/message/index';

const port = 3000;
const app = new Koa();
const router = new Router();

app.use(favouritesRouter.routes());
app.use(searchRouter.routes());
app.use(filesRouter.routes());
app.use(ioRouter.routes());
app.use(messagesRouter.routes());
app.use(router.allowedMethods());
app.use(cors());
app.use(koaBody({
	multipart: true,
	formidable: {
		uploadDir,
		keepExtensions: true,
	},
}));
app.use(bodyParser());

const server = http.createServer(app.callback()).listen(port, () => {
	// eslint-disable-next-line no-console
	console.log('Server started on port 3000');
});
const wsServer = new WebSocketServer({
	server,
});

function sendAllUsers(message) {
	Array.from(wsServer.clients)
		.filter((client) => client.readyState === WebSocket.OPEN)
		.forEach((client) => client.send(message));
}

wsServer.on('connection', (ws) => {
	ws.on('message', (rawData) => {
		const text = JSON.parse(rawData);
		const message = newMessage(text);
		sendAllUsers(JSON.stringify([message]));
	});
	const result = getMessagesSlice(10);
	ws.send(JSON.stringify(result));
});
