import koaBody from 'koa-body';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import Router from '@koa/router';
import Koa from 'koa';
import { faker } from '@faker-js/faker/locale/ru';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import WebSocket, { WebSocketServer } from 'ws';

const server = new Koa();
const router = new Router();

const date = new Date();
let count = 0;
let messages = Array.from(
	{ length: 25 },
	() => {
		const currentDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		count++;
		return {
			id: count,
			text: `${count} ${faker.lorem.paragraphs(2)}`,
			date: currentDate,
			favourites: false,
		};
	},
);
// eslint-disable-next-line no-shadow
const getMessagesSlice = (count) => {
	const existFreshMessage = messages.length - count > 0;
	const existMessages = messages.length - count + 10 > 0;
	return messages.slice(
		existFreshMessage ? messages.length - count : 0,
		existMessages ? messages.length - count + 10 : 0,
	);
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'public/uploads');

server.use(cors());
// Подключаем middleware для парсинга тела запроса
server.use(koaBody({
	multipart: true,
	formidable: {
		// Загрузить каталог
		uploadDir,
		// Сохраняем расширение файла
		keepExtensions: true,
	},
}));
server.use(bodyParser());

// Обработчик GET-запросов
router.get('/messages/:count', (ctx) => {
	// eslint-disable-next-line no-shadow
	const { count } = ctx.params;
	const result = getMessagesSlice(count);
	ctx.body = {
		status: 'ok',
		messages: result.reverse(),
		noMoreData: result.length <= 0,
	};
});

// Обработчик GET-запросов
router.post('/message', (ctx) => {
	messages.push(ctx.request.body.message);
	ctx.body = {
		status: 'ok',
	};
});

router.get('/upload/:filename', (ctx) => {
	const { filename } = ctx.params;
	const filepath = path.join(uploadDir, filename);

	if (fs.existsSync(filepath)) {
		ctx.attachment(filepath);
		ctx.body = fs.createReadStream(filepath);
	} else {
		ctx.status = 404;
		ctx.body = {
			status: 'File not found',
		};
	}
});

router.post('/upload', (ctx) => {
	const files = [];
	if (Array.isArray(ctx.request.files.file)) {
		ctx.request.files.file.forEach((file) => {
			files.push(file);
		});
	} else {
		files.push(ctx.request.files.file);
	}
	const result = files.map((file) => {
		const markupFile = `<a href="http://localhost:3000/upload/${file.path.split('\\').pop()}">${file.name}</a>`;
		const currentDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		const message = {
			id: count++,
			text: markupFile,
			date: currentDate,
			favourites: false,
		};
		messages.push(message);
		return message;
	});
	ctx.body = { result };
});

router.post('/import', (ctx) => {
	const { file } = ctx.request.files;
	fs.readFile(file.path, { encoding: 'utf-8' }, (err, data) => {
		if (!err) {
			messages = JSON.parse(data);
		} else {
			// eslint-disable-next-line no-console
			console.log(err);
		}
	});
	ctx.status = 200;
});

router.get('/export', async (ctx) => {
	ctx.body = messages;
});

router.get('/search/:word', async (ctx) => {
	const { word } = ctx.params;
	const result = messages.filter(
		(message) => message.text.search(word) >= 0,
	);
	ctx.body = {
		messages: result,
	};
});

router.get('/favourites', async (ctx) => {
	const result = messages.filter(
		(message) => message.favourites,
	);
	ctx.body = {
		messages: result,
	};
});

router.post('/favourites/:id', async (ctx) => {
	const { id } = ctx.params;
	const message = messages.find(
		// eslint-disable-next-line no-shadow
		(message) => message.id === Number(id),
	);
	message.favourites = !message.favourites;
	ctx.status = 200;
});

const wsServer = new WebSocketServer({});

function sendAllUsers(message) {
	Array.from(wsServer.clients)
		.filter((client) => client.readyState === WebSocket.OPEN)
		.forEach((client) => client.send(message));
}

wsServer.on('connection', (ws) => {
	ws.on('message', (rawData) => {
		const text = JSON.parse(rawData);
		const currentDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
		const message = {
			id: count++,
			text,
			date: currentDate,
			favourites: false,
		};
		messages.push(message);
		sendAllUsers(JSON.stringify([message]));
	});

	const result = getMessagesSlice(10);
	ws.send(JSON.stringify(result));
});

// Подключаем роутер к приложению
server.use(router.routes());
server.use(router.allowedMethods());

// Запускаем сервер
server.listen(3000, () => {
	// eslint-disable-next-line no-console
	console.log('Server started on port 3000');
});
