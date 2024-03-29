export interface Env {
	DB: KVNamespace;
	CHAT: DurableObjectNamespace;
}

// @ts-ignore
import home from './home.html';

export class ChatRoom {
	state: DurableObjectState;
	users: WebSocket[];
	messages: string[];
	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.users = [];
		this.messages = [];
	}
	handleHome() {
		return new Response(home, {
			headers: {
				'Content-Type': 'text/html;charset=utf-8',
			},
		});
	}
	handleNotFound() {
		return new Response(null, {
			status: 404,
		});
	}
	handleConnect(request: Request) {
		const pairs = new WebSocketPair();
		this.handleWebSocket(pairs[1]);
		return new Response(null, { status: 101, webSocket: pairs[0] });
	}
	handleWebSocket(webSocket: WebSocket) {
		webSocket.accept();
		this.users.push(webSocket);
		webSocket.send(JSON.stringify({ message: 'hello from backend!' }));
		this.messages.forEach((message) => webSocket.send(message));
		webSocket.addEventListener('message', (event) => {
			this.messages.push(event.data.toString());
			this.users.forEach((user) => user.send(event.data));
		});
	}
	async fetch(request: Request) {
		const { pathname } = new URL(request.url);
		switch (pathname) {
			case '/':
				return this.handleHome();
			case '/connect':
				return this.handleConnect(request);
			default:
				return this.handleNotFound();
		}
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const id = env.CHAT.idFromName('CHAT');
		const durableObject = env.CHAT.get(id);
		const response = await durableObject.fetch(request);
		return response;
	},
};
