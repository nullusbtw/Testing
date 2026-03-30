"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Compatibility entrypoint:
// Some deployment setups run `node dist/index.js`.
// After the recent TypeScript build changes, the real server code is emitted to `dist/src/index.js`,
// so this file re-exports (via side-effect import) the actual server.
require("./src/index");
//# sourceMappingURL=index.js.map