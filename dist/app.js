"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const express_favicon_1 = __importDefault(require("express-favicon"));
const morgan_1 = __importDefault(require("morgan"));
// middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.static('public'));
app.use((0, express_favicon_1.default)(__dirname + '/public/favicon.ico'));
// routes
// app.use('/api/v1',);
exports.default = app;
