import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: './tests', testMatch: 'audit-20261014.spec.ts',
 fullyParallel: false, workers: 1, retries: 0,
 reporter: [['list'], ['json', { outputFile: 'test-results/audit-results.json' }]],
 use: { baseURL: 'http://127.0.0.1:4173', headless: true, viewport: {width:1280,height:900}, reducedMotion:'reduce', screenshot:'only-on-failure' },
 webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4173', url:'http://127.0.0.1:4173', reuseExistingServer:false, timeout:30000 },
});
