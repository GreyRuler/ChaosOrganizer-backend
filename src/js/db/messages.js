import { faker } from '@faker-js/faker/locale/ru';

const date = new Date();
let count = 0;

function createMessage(text) {
	const currentDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
	return {
		id: count++,
		text,
		date: currentDate,
		favourites: false,
	};
}

const messages = Array.from(
	{ length: 25 },
	() => createMessage(`${count} ${faker.lorem.paragraphs(2)}`),
);

export function newMessage(text) {
	const message = createMessage(text);
	messages.push(message);
	return message;
}

export default messages;
