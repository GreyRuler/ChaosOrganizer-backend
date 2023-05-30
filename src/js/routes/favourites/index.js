import Router from '@koa/router';
import messages from '../../db/messages';

const favouritesRouter = new Router();

favouritesRouter.get('/favourites', async (ctx) => {
	const result = messages.filter(
		(message) => message.favourites,
	);
	ctx.body = {
		messages: result,
	};
});

favouritesRouter.post('/favourites/:id', async (ctx) => {
	const { id } = ctx.params;
	const message = messages.find(
		// eslint-disable-next-line no-shadow
		(message) => message.id === Number(id),
	);
	message.favourites = !message.favourites;
	ctx.status = 200;
});

export default favouritesRouter;
