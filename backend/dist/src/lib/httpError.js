"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    constructor(opts) {
        super(opts.message);
        this.status = opts.status;
        this.code = opts.code;
        this.details = opts.details;
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=httpError.js.map