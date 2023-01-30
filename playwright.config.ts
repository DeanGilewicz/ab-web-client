import type { PlaywrightTestConfig } from "@playwright/test";
const config: PlaywrightTestConfig = {
	use: {
		headless: true,
		// viewport: { width: 1280, height: 720 },
		ignoreHTTPSErrors: true,
		video: "on-first-retry",
		baseURL: "http://localhost:3000/",
	},
	webServer: {
		command: "npm run start",
		port: 3000,
		reuseExistingServer: true,
		// timeout: 120 * 1000,
	},
	testDir: "src",
	testMatch: "src/App.spec.ts",
};
export default config;
