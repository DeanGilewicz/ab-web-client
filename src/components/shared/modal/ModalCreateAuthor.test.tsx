import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ADD_AUTHOR } from "src/graphql/mutations/author/addAuthor";
import { ModalCreateAuthor } from "./ModalCreateAuthor";

describe("ModalCreateAuthor", () => {
	it("catches onCreateAuthor error", async () => {
		// reduce noise in output while preserving assertion
		const logSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		const user = userEvent.setup();

		// Given there are no authors
		// When the modal is rendered
		render(
			<MockedProvider mocks={[addAuthorMutationMock]} addTypename={false}>
				<ModalCreateAuthor />
			</MockedProvider>
		);
		// and create author button pressed
		await user.click(screen.getByText("Create Author"));

		// Then modal contents is displayed
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Create Author"
		);
		// When first name and last name are filled in with no spaces
		const firstNameInput = screen.getByRole("textbox", { name: "First Name" });
		const lastNameInput = screen.getByRole("textbox", { name: "Last Name" });
		await userEvent.type(firstNameInput, "Demo");
		await userEvent.type(lastNameInput, "User");
		// and create button is pressed
		await user.click(screen.getByText("Create"));

		// Then the mutation error is caught and its called 1 time
		expect(logSpy).toHaveBeenCalledTimes(1);
		// and first param is component error message
		expect(logSpy.mock.calls[0][0]).toEqual("onCreateAuthor error");
		// and second param is the actual error that was thrown
		expect(logSpy.mock.calls[0][1].toString()).toContain(
			"Error: Error adding author"
		);
		// and modal is still open
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Create Author"
		);
	});
});

const addAuthorMutationMock: Readonly<MockedResponse> = {
	request: {
		query: ADD_AUTHOR,
		variables: { input: { firstName: "Demo", lastName: "User" } },
	},
	error: {
		name: "addAuthorMutationMock error",
		message: "Error adding author",
	},
};
