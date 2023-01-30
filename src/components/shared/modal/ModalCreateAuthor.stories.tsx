import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MockedResponse } from "@apollo/client/testing";
import { userEvent, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { sbDomFindByText, wait } from "src/testUtils";
import { ModalCreateAuthor } from "./ModalCreateAuthor";
import { ADD_AUTHOR } from "src/graphql/mutations/author/addAuthor";

export default {
	title: "Shared/Modal/Create Author",
	component: ModalCreateAuthor,
} as ComponentMeta<typeof ModalCreateAuthor>;

const Template: ComponentStory<typeof ModalCreateAuthor> = () => (
	<ModalCreateAuthor />
);

export const Default = Template.bind({});

export const OpenEmpty = Template.bind({});
OpenEmpty.play = async ({ canvasElement }) => {
	// Given component is rendered
	const canvas = within(canvasElement);

	// When trigger button is pressed
	await userEvent.click(canvas.getByText("Create Author"));

	// Then modal is rendered with form
	const portalEl = document.querySelector("#portal-root");
	expect(portalEl?.querySelector("h3")?.textContent).toContain("Create Author");
	expect(
		portalEl?.querySelector("input[name='first-name']")
	).toBeInTheDocument();
	expect(
		portalEl?.querySelector("input[name='last-name']")
	).toBeInTheDocument();
};

export const OpenFilled = Template.bind({});
OpenFilled.play = async ({ canvasElement }) => {
	// Given component is rendered
	const canvas = within(canvasElement);

	// When trigger button is pressed
	await userEvent.click(canvas.getByText("Create Author"));

	// Then modal is rendered with form
	const portalEl = document.querySelector("#portal-root");
	expect(portalEl).toBeInTheDocument();

	// When we provide a first name and last name
	const firstNameInput = portalEl?.querySelector(
		"input[name='first-name']"
	) as HTMLInputElement;
	const lastNameInput = portalEl?.querySelector(
		"input[name='last-name']"
	) as HTMLInputElement;
	await userEvent.type(firstNameInput, "Demo");
	await userEvent.type(lastNameInput, "User");

	// Then the input values are updated
	expect(firstNameInput.value).toEqual("Demo");
	expect(lastNameInput.value).toEqual("User");
};

export const OpenErrors = Template.bind({});
OpenErrors.play = async ({ canvasElement }) => {
	// Given component is rendered
	const canvas = within(canvasElement);

	// When trigger button is pressed
	await userEvent.click(canvas.getByText("Create Author"));

	// Then modal is rendered with form
	const portalEl = document.querySelector("#portal-root");
	expect(portalEl).toBeInTheDocument();

	// When we press create
	const createButton = sbDomFindByText(portalEl!, "button", "Create");
	await userEvent.click(createButton!);

	// Then error messages are displayed
	expect(portalEl?.textContent).toContain(
		"Provided first name must not have spaces"
	);
	expect(portalEl?.textContent).toContain(
		"Provided last name must not have spaces"
	);
};

export const Play = Template.bind({});
Play.parameters = {
	apolloClient: {
		mocks: [addAuthorMutationMock()],
	},
};
Play.play = async ({ canvasElement }) => {
	// Given component is rendered
	const canvas = within(canvasElement);

	// When trigger button is pressed
	await userEvent.click(canvas.getByText("Create Author"));

	// Then modal is rendered with form
	const portalEl = document.querySelector("#portal-root");
	expect(portalEl).toBeInTheDocument();

	// When we provide a first name and last name
	const firstNameInput = portalEl?.querySelector(
		"input[name='first-name']"
	) as HTMLInputElement;
	const lastNameInput = portalEl?.querySelector(
		"input[name='last-name']"
	) as HTMLInputElement;
	await userEvent.type(firstNameInput, "Demo");
	await userEvent.type(lastNameInput, "User");

	// Then the input values are updated
	expect(firstNameInput.value).toEqual("Demo");
	expect(lastNameInput.value).toEqual("User");

	// When we press create
	const createButton = sbDomFindByText(portalEl!, "button", "Create");
	await userEvent.click(createButton!);
	// and wait for refetchQueries to resolve
	await wait();
	// Then mutation is called and modal is closed
	expect(firstNameInput).not.toBeInTheDocument();
	expect(lastNameInput).not.toBeInTheDocument();
};

function addAuthorMutationMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: ADD_AUTHOR,
			variables: { input: { firstName: "Demo", lastName: "User" } },
		},
		result: {
			data: {
				addAuthor: {
					id: "a:1",
					firstName: "Demo",
					lastName: "User",
				},
			},
		},
	};
}
