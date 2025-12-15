/**
 * doccc - Main Entry Point
 * 
 * README Website Generator - Compile components into GitHub-safe documentation
 */

export { loadConfig, validateConfig, getDefaultConfig } from './config/loader.js';
export { build } from './commands/build.js';
export { init } from './commands/init.js';
export { watch } from './commands/watch.js';
export { preview } from './commands/preview.js';
export { generate } from './commands/generate.js';
export { stats } from './commands/stats.js';
export { notify } from './commands/notify.js';

// Component exports
export * from './components/index.js';

// Layout exports
export * from './layouts/index.js';

// SVG generators
export * from './generators/svg/index.js';

// Theme system
export * from './theme/index.js';

// Baseplates
export * as baseplates from './baseplates/index.js';

// Utilities
export * from './utils/index.js';

// Version
export const VERSION = '1.0.0';
