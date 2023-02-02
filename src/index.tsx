import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { BrowserRouter } from "react-router-dom";

import "src/normalize.css";
import "src/indexStyles.css";

import App from "src/App";

const { REACT_APP_API_URL } = process.env;

// const httpLink = new HttpLink({
// 	uri: "http://localhost:8080/graphql",
// });

// Log any GraphQL errors or network error that occurred
// const errorLink = onError(({ graphQLErrors, networkError }) => {
// 	if (graphQLErrors)
// 		graphQLErrors.forEach(({ message, locations, path }) =>
// 			console.log(
// 				`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
// 			)
// 		);
// 	if (networkError) console.log(`[Network error]: ${networkError}`);
// });

const client = new ApolloClient({
	uri: `${REACT_APP_API_URL}/graphql`,
	// link: from([errorLink, httpLink]),
	cache: new InMemoryCache({
		typePolicies: {
			Author: {
				fields: {
					books: {
						merge(existing = [], incoming: any[]) {
							// default behavior
							return incoming;
						},
					},
				},
			},
		},
	}),
	resolvers: {
		Author: {
			fullName: (author, _args, _ctx, _info) => {
				return `${author.firstName} ${author.lastName}`;
			},
		},
	},
});

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

root.render(
	<ApolloProvider client={client}>
		<React.StrictMode>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</React.StrictMode>
	</ApolloProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
