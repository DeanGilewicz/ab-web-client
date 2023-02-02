import { render, screen } from "@testing-library/react";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
	it("renders network errors", () => {
		// Given error is a network error
		// When error message exists
		render(
			<ErrorMessage
				error={{
					name: "network error",
					message: "network error",
					graphQLErrors: [],
					clientErrors: [],
					networkError: { name: "network error", message: "network error" },
					extraInfo: "",
				}}
			/>
		);
		// Then network error is displayed
		expect(screen.getByText("network error")).toBeInTheDocument();
	});

	it("renders graphQLErrors errors", () => {
		// Given error is a graphQL error
		// When error message exists
		render(
			<ErrorMessage
				error={{
					name: "graphQL error",
					message: "graphQL error",
					graphQLErrors: [
						{
							name: "graphQL error",
							locations: [],
							path: [""],
							nodes: [],
							source: undefined,
							positions: [],
							originalError: {
								name: "original error",
								message: "original error",
							},
							message: "graphQL error",
							extensions: { none: "" },
							toJSON: () => ({ message: "graphQL error" }),
							[Symbol.toStringTag]: "",
						},
					],
					clientErrors: [],
					networkError: null,
					extraInfo: "",
				}}
			/>
		);
		// Then graphQL error is displayed
		expect(screen.getByText("graphQL error")).toBeInTheDocument();
	});

	it("renders client errors", () => {
		// Given error is a client error
		// When error message exists
		render(
			<ErrorMessage
				error={{
					name: "client error",
					message: "client error",
					graphQLErrors: [],
					clientErrors: [
						{
							name: "client error",
							message: "client error",
						},
					],
					networkError: null,
					extraInfo: "",
				}}
			/>
		);
		// Then client error is displayed
		expect(screen.getByText("client error")).toBeInTheDocument();
	});

	it("throws when error is not handled", () => {
		// reduce noise in output
		jest.spyOn(console, "error").mockImplementation(() => {});

		// Given an error that is not a network error, graphQL error or client error
		// When an unhandled error exists
		// Then an error is thrown
		expect(() =>
			render(
				<ErrorMessage
					error={{
						name: "unhandled error",
						message: "unhandled error",
						graphQLErrors: [],
						clientErrors: [],
						networkError: null,
						extraInfo: "",
					}}
				/>
			)
		).toThrow("Provided error is not handled by ErrorMessage component");
	});
});
