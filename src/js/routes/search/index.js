import Router from '@koa/router';
import messages from '../../db/messages.js';

const searchRouter = new Router();

searchRouter.get('/search/:word', async (ctx) => {
	const { word } = ctx.params;
	const result = messages.filter(
		(message) => message.text.search(word) >= 0,
	);
	ctx.body = {
		messages: result,
	};
});

export default searchRouter;
