import path from 'path';
import fs from 'fs';
import Router from '@koa/router';
import uploadDir from '../../uploadDir.js';
import { newMessage } from '../../db/messages.js';

const filesRouter = new Router();

filesRouter.get('/upload/:filename', (ctx) => {
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

filesRouter.post('/upload', (ctx) => {
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
		return newMessage(markupFile);
	});
	ctx.body = { result };
});

export default filesRouter;
