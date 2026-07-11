const fs = require('fs');

let content = fs.readFileSync('src/lib/mathUtils.ts', 'utf-8');

// I will just rewrite the file content since it is not too large.
