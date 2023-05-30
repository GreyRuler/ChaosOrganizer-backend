import fs from 'fs';
import Router from '@koa/router';
import messages from '../../db/messages';

const ioRouter = new Router();

ioRouter.post('/import', (ctx) => {
	const { file } = ctx.request.files;
	fs.readFile(file.path, { encoding: 'utf-8' }, (err, data) => {
		if (!err) {
			const newMessages = JSON.parse(data);
			messages.splice(0, messages.length);
			newMessages.forEach((message) => {
				messages.push(message);
			});
		} else {
			// eslint-disable-next-line no-console
			console.log(err);
		}
	});
	ctx.status = 200;
});

ioRouter.get('/export', async (ctx) => {
	ctx.body = messages;
});

export default ioRouter;
