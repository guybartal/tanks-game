import { Server as ColyseusServer } from '@colyseus/core';
import { Server as SocketIOServer } from 'socket.io';
declare const app: import("express-serve-static-core").Express;
declare const httpServer: import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>;
declare const io: SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
declare const gameServer: ColyseusServer<any, any>;
export { app, io, httpServer, gameServer };
//# sourceMappingURL=index.d.ts.map