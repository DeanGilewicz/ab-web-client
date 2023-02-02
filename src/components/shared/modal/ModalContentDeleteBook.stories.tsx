import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MockedResponse } from "@apollo/client/testing";
import { ModalConfirmation } from "./ModalConfirmation";
import { userEvent, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { sbDomFindByText, wait } from "src/testUtils";
import { ModalContentDeleteBook } from "./ModalContentDeleteBook";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { DELETE_BOOK } from "src/graphql/mutations/book/deleteBook";

export default {
	title: "Shared/Modal/Delete Book",
	component: ModalContentDeleteBook,
	parameters: {
		apolloClient: {
			mocks: [deleteBookMutationMock()],
		},
	},
	argTypes: {
		bookId: {
			table: {
				disable: true,
			},
		},
	},
} as ComponentMeta<typeof ModalContentDeleteBook>;

const Template: ComponentStory<typeof ModalContentDeleteBook> = () => (
	<MemoryRouter initialEntries={["/"]}>
		<Routes>
			<Route
				path={"/"}
				element={
					<ModalConfirmation
						content={<ModalContentDeleteBook bookId="b:1" />}
						title={`Delete Test Book`}
						triggerText="Open Modal"
					/>
				}
			/>
			<Route path={"/books"} element={<div>Redirect</div>} />
		</Routes>
	</MemoryRouter>
);

export const Default = Template.bind({});

export const OpenScreen1 = Template.bind({});
OpenScreen1.play = async ({ canvasElement }) => {
	// Given component is rendered
	const canvas = within(canvasElement);

	// When trigger button is pressed
	await userEvent.click(canvas.getByText("Open Modal"));

	// Then modal is rendered with initial message
	const portalEl = document.querySelector("#portal-root");
	expect(portalEl?.textContent).toContain(
		"Are you sure you want to perform this action?"
	);
};

export const OpenScreen2 = Template.bind({});
OpenScreen2.play = async ({ canvasElement }) => {
	// Given component is rendered
	const canvas = within(canvasElement);

	// When trigger button is pressed
	await userEvent.click(canvas.getByText("Open Modal"));

	// Then modal is rendered with initial message
	const portalEl = document.querySelector("#portal-root");
	expect(portalEl?.textContent).toContain(
		"Are you sure you want to perform this action?"
	);

	// When continue button is pressed
	const continueButton = sbDomFindByText(portalEl!, "button", "Continue");
	await userEvent.click(continueButton!);

	// Then second message is rendered
	expect(portalEl?.textContent).toContain("You are about to delete this book.");
};

export const Play = Template.bind({});
Play.play = async ({ canvasElement }) => {
	// Given component is rendered
	const canvas = within(canvasElement);

	// When trigger button is pressed
	await userEvent.click(canvas.getByText("Open Modal"));

	// Then modal is rendered with initial message
	const portalEl = document.querySelector("#portal-root");
	expect(portalEl?.textContent).toContain(
		"Are you sure you want to perform this action?"
	);

	// When continue button is pressed
	const continueButton = sbDomFindByText(portalEl!, "button", "Continue");
	await userEvent.click(continueButton!);

	// Then second message is rendered
	expect(portalEl?.textContent).toContain("You are about to delete this book.");

	// When pressing delete book
	const deleteButton = sbDomFindByText(portalEl!, "button", "Delete Book");
	await userEvent.click(deleteButton!);
	// and wait for refetchQueries to resolve
	await wait();

	// Then mutation is called and redirect occurs
	expect(portalEl?.textContent).not.toContain(
		"You are about to delete this book."
	);
	expect(canvas.getByText("Redirect")).toBeInTheDocument();
};

function deleteBookMutationMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: DELETE_BOOK,
			variables: { input: { id: "b:1" } },
		},
		result: {
			data: {
				deleteBook: {
					id: "b:1",
				},
			},
		},
	};
}
