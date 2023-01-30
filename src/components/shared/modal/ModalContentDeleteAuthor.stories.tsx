import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ModalContentDeleteAuthor } from "./ModalContentDeleteAuthor";
import { DELETE_AUTHOR } from "src/graphql/mutations/author/deleteAuthor";
import { MockedResponse } from "@apollo/client/testing";
import { ModalConfirmation } from "./ModalConfirmation";
import { userEvent, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { sbDomFindByText, wait } from "src/testUtils";

export default {
	title: "Shared/Modal/Delete Author",
	component: ModalContentDeleteAuthor,
	parameters: {
		apolloClient: {
			mocks: [deleteAuthorMutationMock()],
		},
	},
	argTypes: {
		authorId: {
			table: {
				disable: true,
			},
		},
	},
} as ComponentMeta<typeof ModalContentDeleteAuthor>;

const Template: ComponentStory<typeof ModalContentDeleteAuthor> = () => (
	<ModalConfirmation
		content={<ModalContentDeleteAuthor authorId="a:1" />}
		title="Delete Author"
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
		"You are about to delete this author. This action is not reversible!"
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
		"You are about to delete this author. This action is not reversible!"
	);

	// When pressing delete author
	const deleteButton = sbDomFindByText(portalEl!, "button", "Delete Author");
	await userEvent.click(deleteButton!);
	// and wait for refetchQueries to resolve
	await wait();

	// Then mutation is called and modal is closed
	expect(portalEl?.textContent).not.toContain(
		"You are about to delete this author. This action is not reversible!"
	);
};

function deleteAuthorMutationMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: DELETE_AUTHOR,
			variables: { input: { id: "a:1" } },
		},
		result: {
			data: {
				deleteAuthor: { id: "a:1" },
			},
		},
	};
}
