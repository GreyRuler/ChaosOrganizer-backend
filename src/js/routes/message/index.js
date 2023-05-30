import Router from '@koa/router';
import getMessagesSlice from './utils/messagesSlice';
import { newMessage } from '../../db/messages';

const messagesRouter = new Router();

messagesRouter.get('/messages/:count', (ctx) => {
	// eslint-disable-next-line no-shadow
	const { count } = ctx.params;
	const result = getMessagesSlice(count);
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
