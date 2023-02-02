import { MockedResponse } from "@apollo/client/testing";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { BOOKS } from "src/graphql/queries/book/books";
import { BooksPage } from "./BooksPage";

export default {
	title: "Page/Books",
	component: BooksPage,
	parameters: {
		apolloClient: {
			mocks: [booksQueryMock()],
		},
	},
} as ComponentMeta<typeof BooksPage>;

const Template: ComponentStory<typeof BooksPage> = () => {
	return (
		<MemoryRouter initialEntries={["/books"]}>
			<Routes>
				<Route path={"/books"} element={<BooksPage />} />
			</Routes>
		</MemoryRouter>
	);
};

export const Default = Template.bind({});

function booksQueryMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: BOOKS,
		},
		result: {
			data: {
				books: [
					{
						id: "b:1",
						title: "A Book",
						author: {
							id: "a:1",
						},
					},
				],
			},
		},
	};
}
