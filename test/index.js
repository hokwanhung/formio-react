// commonly used by webpacks for creating contexts with files that match the specific patterns.
const testsContext = require.context('.', true, /\.spec\.js$/);
// run every testsContext in the process.
testsContext.keys().forEach(testsContext);
