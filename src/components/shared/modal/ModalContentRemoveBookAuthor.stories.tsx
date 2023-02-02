import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MockedResponse } from "@apollo/client/testing";
import { ModalConfirmation } from "./ModalConfirmation";
import { userEvent, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { sbDomFindByText, wait } from "src/testUtils";
import { ModalContentRemoveBookAuthor } from "./ModalContentRemoveBookAuthor";
import { REMOVE_BOOK_AUTHOR } from "src/graphql/mutations/book/removeBookAuthor";

export default {
	title: "Shared/Modal/Remove Book Author",
	component: ModalContentRemoveBookAuthor,
	parameters: {
		apolloClient: {
			mocks: [removeBookAuthorMutationMock()],
		},
	},
	argTypes: {
		bookId: {
			table: {
				disable: true,
			},
		},
	},
} as ComponentMeta<typeof ModalContentRemoveBookAuthor>;

const Template: ComponentStory<typeof ModalContentRemoveBookAuthor> = () => (
	<ModalConfirmation
		content={<ModalContentRemoveBookAuthor bookId="b:1" />}
		title="Remove Book"
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
		"You are about to remove this author from this book. This action is not reversible!"
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
		"You are about to remove this author from this book. This action is not reversible!"
	);

	// When pressing delete author
	const deleteButton = sbDomFindByText(portalEl!, "button", "Remove Author");
	await userEvent.click(deleteButton!);
	// and wait for cache to be modified
	await wait();

	// Then mutation is called and modal is closed
	expect(portalEl?.textContent).not.toContain(
		"You are about to remove this author from this book. This action is not reversible!"
	);
};

function removeBookAuthorMutationMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: REMOVE_BOOK_AUTHOR,
			variables: {
				input: {
					id: "b:1",
				},
			},
		},
		result: {
			data: {
				removeBookAuthor: {
					id: "b:1",
					author: null,
				},
			},
		},
	};
}
