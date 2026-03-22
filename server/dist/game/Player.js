"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const schema_1 = require("@colyseus/schema");
class Player extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.id = '';
        this.name = '';
        this.x = 0;
        this.y = 0;
        this.rotation = 0; // Tank body rotation
        this.turretRotation = 0; // Turret aim direction
        this.health = 100;
        this.kills = 0;
        this.deaths = 0;
        this.isAlive = true;
        this.lastInputSeq = 0; // For client reconciliation
        // Non-synced server-side state
        this.respawnTime = 0;
        this.lastFireTime = 0;
    }
}
exports.Player = Player;
__decorate([
    (0, schema_1.type)('string'),
    __metadata("design:type", String)
], Player.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)('string'),
    __metadata("design:type", String)
], Player.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Player.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Player.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Player.prototype, "rotation", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Player.prototype, "turretRotation", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Player.prototype, "health", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Player.prototype, "kills", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Player.prototype, "deaths", void 0);
__decorate([
    (0, schema_1.type)('boolean'),
    __metadata("design:type", Boolean)
], Player.prototype, "isAlive", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Player.prototype, "lastInputSeq", void 0);
//# sourceMappingURL=Player.js.map