import { ApolloError } from "@apollo/client";

export function ErrorMessage(props: { error: ApolloError }) {
	const { error } = props;
	if (error.networkError) {
		return <span>{error.networkError.message}</span>;
	}

	if (error.graphQLErrors.length > 0) {
		return (
			<ul>
				{error.graphQLErrors.map((e) => (
					<li key={e.message}>{e.message}</li>
				))}
			</ul>
		);
	}

	if (error.clientErrors.length > 0) {
		return (
			<ul>
				{error.clientErrors.map((e) => (
					<li key={e.message}>{e.message}</li>
				))}
			</ul>
		);
	}

	throw new Error("Provided error is not handled by ErrorMessage component");
}
