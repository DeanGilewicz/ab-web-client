module.exports = {
	stories: [
		"../src/**/*.mdx",
		"../src/**/*.stories.mdx../src/**/*.stories.mdx",
		"../src/**/*.stories.@(js|jsx|ts|tsx)",
	],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		"@storybook/preset-create-react-app",
		"@storybook/client-api",
		"@storybook/addon-coverage",
		// https://github.com/storybookjs/addon-coverage
		// {
		// 	name: "@storybook/addon-coverage",
		// 	options: {
		// 		istanbul: {
		// 			include: ["**/stories/**"],
		// 		},
		// 	},
		// },
		"storybook-addon-apollo-client",
	],
	framework: "@storybook/react",
	core: {
		builder: "@storybook/builder-webpack5",
	},
};
