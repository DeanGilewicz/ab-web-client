import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MockedResponse } from "@apollo/client/testing";
import { userEvent, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { sbDomFindByText, wait } from "src/testUtils";
import { ModalCreateBook } from "./ModalCreateBook";
import { ADD_BOOK } from "src/graphql/mutations/book/addBook";

export default {
	title: "Shared/Modal/Create Book",
	component: ModalCreateBook,
} as ComponentMeta<typeof ModalCreateBook>;

const Template: ComponentStory<typeof ModalCreateBook> = () => (
	<ModalCreateBook />
);

export const Default = Template.bind({});

export const OpenEmpty = Template.bind({});
OpenEmpty.play = async ({ canvasElement }) => {
	// Given component is rendered
	const canvas = within(canvasElement);

	// When trigger button is pressed
	await userEvent.click(canvas.getByText("Create Book"));

	// Then modal is rendered with form
	const portalEl = document.querySelector("#portal-root");
	expect(portalEl?.querySelector("h3")?.textContent).toContain("Create Book");
	expect(
		portalEl?.querySelector("input[name='book-title']")
	).toBeInTheDocument();
	// and create button is disabled
	const createButton = sbDomFindByText(portalEl!, "button", "Create");
	expect(createButton).toBeDisabled();
};

export const OpenFilled = Template.bind({});
OpenFilled.play = async ({ canvasElement }) => {
	// Given component is rendered
	const canvas = within(canvasElement);

	// When trigger button is pressed
	await userEvent.click(canvas.getByText("Create Book"));

	// Then modal is rendered with form
	const portalEl = document.querySelector("#portal-root");
	expect(portalEl?.querySelector("h3")?.textContent).toContain("Create Book");

	// When we provide a book title
	const bookTitleInput = portalEl?.querySelector(
		"input[name='book-title']"
	) as HTMLInputElement;
	await userEvent.type(bookTitleInput, "A Book");

	// Then the input values are updated
	expect(bookTitleInput.value).toEqual("A Book");
};

export const Play = Template.bind({});
Play.parameters = {
	apolloClient: {
		mocks: [addBookMutationMock()],
	},
};
Play.play = async ({ canvasElement }) => {
	// Given component is rendered
	const canvas = within(canvasElement);

	// When trigger button is pressed
	await userEvent.click(canvas.getByText("Create Book"));

	// Then modal is rendered with form
	const portalEl = document.querySelector("#portal-root");
	expect(portalEl?.querySelector("h3")?.textContent).toContain("Create Book");

	// When we provide a book title
	const bookTitleInput = portalEl?.querySelector(
		"input[name='book-title']"
	) as HTMLInputElement;
	await userEvent.type(bookTitleInput, "A Book");

	// Then the input values are updated
	expect(bookTitleInput.value).toEqual("A Book");

	// When we press create
	const createButton = sbDomFindByText(portalEl!, "button", "Create");
	await userEvent.click(createButton!);
	// and wait for refetchQueries to resolve
	await wait();
	// Then mutation is called and modal is closed
	expect(bookTitleInput).not.toBeInTheDocument();
};

function addBookMutationMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: ADD_BOOK,
			variables: { input: { title: "A Book" } },
		},
		result: {
			data: {
				addBook: {
					id: "b:1",
					title: "A Book",
				},
			},
		},
	};
}
