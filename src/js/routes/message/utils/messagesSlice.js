export default function getMessagesSlice(messages, count) {
	const existFreshMessage = messages.length - count > 0;
	const existMessages = messages.length - count + 10 > 0;
	return messages.slice(
		existFreshMessage ? messages.length - count : 0,
		existMessages ? messages.length - count + 10 : 0,
	);
}
