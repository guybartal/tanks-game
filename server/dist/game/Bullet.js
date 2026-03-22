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
exports.Bullet = void 0;
const schema_1 = require("@colyseus/schema");
class Bullet extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.id = '';
        this.ownerId = '';
        this.x = 0;
        this.y = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.createdAt = 0;
    }
}
exports.Bullet = Bullet;
__decorate([
    (0, schema_1.type)('string'),
    __metadata("design:type", String)
], Bullet.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)('string'),
    __metadata("design:type", String)
], Bullet.prototype, "ownerId", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Bullet.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Bullet.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Bullet.prototype, "velocityX", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Bullet.prototype, "velocityY", void 0);
__decorate([
    (0, schema_1.type)('number'),
    __metadata("design:type", Number)
], Bullet.prototype, "createdAt", void 0);
//# sourceMappingURL=Bullet.js.map