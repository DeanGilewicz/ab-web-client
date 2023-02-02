import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MockedResponse } from "@apollo/client/testing";
import { ModalConfirmation } from "./ModalConfirmation";
import { userEvent, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { sbDomFindByText, wait } from "src/testUtils";
import { ModalContentDeleteAuthorBook } from "./ModalContentDeleteAuthorBook";
import { DELETE_AUTHOR_BOOKS } from "src/graphql/mutations/author/deleteAuthorBooks";

export default {
	title: "Shared/Modal/Delete Author Book",
	component: ModalContentDeleteAuthorBook,
	parameters: {
		apolloClient: {
			mocks: [deleteAuthorBooksMutationMock()],
		},
	},
	argTypes: {
		authorId: {
			table: {
				disable: true,
			},
		},
		bookId: {
			table: {
				disable: true,
			},
		},
	},
} as ComponentMeta<typeof ModalContentDeleteAuthorBook>;

const Template: ComponentStory<typeof ModalContentDeleteAuthorBook> = () => (
	<ModalConfirmation
		content={<ModalContentDeleteAuthorBook authorId="a:1" bookId="b:1" />}
		title={`Remove Test Book`}
		triggerText="Open Modal"
	/>
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
	expect(portalEl?.textContent).toContain(
		"You are about to remove this book from this author."
	);
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
	expect(portalEl?.textContent).toContain(
		"You are about to remove this book from this author."
	);

	// When pressing delete author
	const deleteButton = sbDomFindByText(portalEl!, "button", "Remove Book");
	await userEvent.click(deleteButton!);
	// and wait for refetchQueries to resolve
	await wait();

	// Then mutation is called and modal is closed
	expect(portalEl?.textContent).not.toContain(
		"You are about to remove this book from this author."
	);
};

function deleteAuthorBooksMutationMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: DELETE_AUTHOR_BOOKS,
			variables: {
				input: {
					id: "a:1",
					bookIds: ["b:1"],
				},
			},
		},
		result: {
			data: {
				deleteAuthorBooks: {
					id: "a:1",
					firstName: "Demo",
					lastName: "User",
					books: [],
				},
			},
		},
	};
}
