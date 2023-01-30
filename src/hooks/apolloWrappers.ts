import {
	ApolloError,
	ServerError,
	useLazyQuery as apolloUseLazyQuery,
	useMutation as apolloUseMutation,
	useQuery as apolloUseQuery,
} from "@apollo/client";
import { useCallback } from "react";

import { AlertContextProps, useAlertContext } from "src/contexts/AlertContext";

export type {
	LazyQueryHookOptions,
	MutationHookOptions,
	QueryHookOptions,
} from "@apollo/client";

/** Wraps the Apollo `useQuery` with default `onError` behavior. */
export const useQuery: typeof apolloUseQuery = function (query, options) {
	const { showError } = useAlertContext();
	const onError = useCallback(
		(error: ApolloError) => alertOnError("query", showError, error),
		[showError]
	);
	return apolloUseQuery(query, { onError, ...options });
};

/** Wraps the Apollo `useLazyQuery` with default `onError` behavior. */
export const useLazyQuery: typeof apolloUseLazyQuery = function (
	query,
	options
) {
	const { showError } = useAlertContext();
	const onError = useCallback(
		(error: ApolloError) => alertOnError("query", showError, error),
		[showError]
	);
	return apolloUseLazyQuery(query, { onError, ...options });
};

/** Wraps the Apollouse `useMutation` with with default `onError` behavior. */
export const useMutation: typeof apolloUseMutation = function (
	mutation,
	options
) {
	const { showError } = useAlertContext();
	const onError = useCallback(
		(error: ApolloError) => alertOnError("mutation", showError, error),
		[showError]
	);

	const result = apolloUseMutation(mutation, { onError, ...options });
	return result as any;
};

/**
 * An array of message+locations+path keys since that is observed
 * behavior of our GraphQl server in the result["errors"] key
 */
type GraphQLError = { message: string; locations: unknown; path: unknown };

function alertOnError(
	type: "query" | "mutation",
	showError: AlertContextProps["showError"],
	error: ApolloError
): void {
	const result = (error.networkError as ServerError)?.result;
	const errors = result?.errors as GraphQLError[] | undefined;

	// If the call failed for some non-BE reason then show error
	const message =
		!result || !errors || errors.length === 0
			? error.message
			: errors.map((e) => e.message).join(", ");

	// Show Alert
	showError(message);

	// Trigger a console.error for a logging service to report on.
	console.error(message);

	/**
	 * If a component is invoking a mutation in an event callback like:
	 *
	 * const [saveAuthor] = useSaveAuthor();
	 *
	 * function onClick() {
	 * 	const { data } = await saveMutation(...)
	 *	console.log(data.foo.bar);
	 * }
	 *
	 * The default Apollo behavior is for that promise to be rejected, therefore the
	 * console.log will never happen. For our alertOnError instrumentation to maintain
	 * the same behavior, we need to re-throw the error from our onError
	 */
	if (type === "mutation") {
		throw error;
	}
}
