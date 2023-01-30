import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ADD_BOOK } from "src/graphql/mutations/book/addBook";
import { ModalCreateBook } from "./ModalCreateBook";

describe("ModalCreateBook", () => {
	it("catches onCreateBook error", async () => {
		// reduce noise in output while preserving assertion
		const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		const user = userEvent.setup();

		// Given there are no books
		// When the modal is rendered
		render(
			<MockedProvider mocks={[addBookMutationMock]} addTypename={false}>
				<ModalCreateBook />
			</MockedProvider>
		);
		// and create book button pressed
		await user.click(screen.getByText("Create Book"));

		// Then modal contents is displayed
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Create Book"
		);

		// When title field is filled in
		const titleInput = screen.getByRole("textbox", { name: "Title" });
		await userEvent.type(titleInput, "A Book");
		// and create button is pressed
		await user.click(screen.getByText("Create"));

		// Then the mutation error is caught and its called 1 time
		expect(logSpy).toHaveBeenCalledTimes(1);
		// and first param is component error message
		expect(logSpy.mock.calls[0][0]).toEqual("onCreateBook error");
		// and second param is the actual error that was thrown
		expect(logSpy.mock.calls[0][1].toString()).toContain(
			"Error: Error adding book"
		);
		// and modal is still open
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Create Book"
		);
	});
});

const addBookMutationMock: Readonly<MockedResponse> = {
	request: {
		query: ADD_BOOK,
		variables: { input: { title: "A Book" } },
	},
	error: {
		name: "addBookMutationMock error",
		message: "Error adding book",
	},
};
