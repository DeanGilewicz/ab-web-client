import { MockedProvider } from "@apollo/client/testing";

import "../src/normalize.css";
import "../src/indexStyles.css";
import "../src/AppStyles.css";

export const parameters = {
	actions: { argTypesRegex: "^on[A-Z].*" },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
	apolloClient: { MockedProvider },
};
