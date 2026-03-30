export declare class HttpError extends Error {
    status: number;
    code: string;
    details?: unknown;
    constructor(opts: {
        status: number;
        code: string;
        message: string;
        details?: unknown;
    });
}
//# sourceMappingURL=httpError.d.ts.map