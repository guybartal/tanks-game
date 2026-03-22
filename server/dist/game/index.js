"use strict";
// Colyseus game module exports
// Main game logic lives in GameRoom.ts using Colyseus Schema
Object.defineProperty(exports, "__esModule", { value: true });
exports.BULLET_RADIUS = exports.TANK_RADIUS = exports.Bullet = exports.Player = exports.GameState = exports.GameRoom = void 0;
var GameRoom_1 = require("./GameRoom");
Object.defineProperty(exports, "GameRoom", { enumerable: true, get: function () { return GameRoom_1.GameRoom; } });
var GameState_1 = require("./GameState");
Object.defineProperty(exports, "GameState", { enumerable: true, get: function () { return GameState_1.GameState; } });
var Player_1 = require("./Player");
Object.defineProperty(exports, "Player", { enumerable: true, get: function () { return Player_1.Player; } });
var Bullet_1 = require("./Bullet");
Object.defineProperty(exports, "Bullet", { enumerable: true, get: function () { return Bullet_1.Bullet; } });
// Game constants (shared between server and can be used by client)
exports.TANK_RADIUS = 20;
exports.BULLET_RADIUS = 5;
//# sourceMappingURL=index.js.map