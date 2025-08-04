/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: { unoptimized: true },
	typescript: {
		// Ignore TypeScript errors during build (not recommended for production)
		ignoreBuildErrors: true,
	},
	// Exclude test files from compilation
	webpack: (config, { isServer }) => {
		// Exclude Cypress and test files from webpack compilation
		config.module.rules.push({
			test: /\.(spec|test|cy)\.(js|jsx|ts|tsx)$/,
			loader: "ignore-loader",
		});

		return config;
	},

	// Exclude directories from compilation
	experimental: {
		// Exclude specific directories
		outputFileTracingExcludes: {
			"*": [
				"cypress/**/*",
				"**/*.cy.{js,jsx,ts,tsx}",
				"**/*.spec.{js,jsx,ts,tsx}",
				"**/*.test.{js,jsx,ts,tsx}",
			],
		},
	},
};

module.exports = nextConfig;
