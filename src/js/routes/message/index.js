import Router from '@koa/router';
import getMessagesSlice from './utils/messagesSlice.js';
import messages, { newMessage } from '../../db/messages.js';

const messagesRouter = new Router();

messagesRouter.get('/messages/:count', (ctx) => {
	// eslint-disable-next-line no-shadow
	const { count } = ctx.params;
	const result = getMessagesSlice(messages, count);
	ctx.body = {
		status: 'ok',
		messages: result.reverse(),
		noMoreData: result.length <= 0,
	};
});

messagesRouter.post('/message', (ctx) => {
	// eslint-disable-next-line no-console
	console.log(ctx.request.body.message);
	newMessage(ctx.request.body.message);
	ctx.body = {
		status: 'ok',
	};
});

export default messagesRouter;
