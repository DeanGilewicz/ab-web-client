import { MockedResponse } from "@apollo/client/testing";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { BOOK } from "src/graphql/queries/book/book";
import { BookPage } from "./BookPage";

export default {
	title: "Page/Book",
	component: BookPage,
	parameters: {
		apolloClient: {
			mocks: [bookQueryMock()],
		},
	},
} as ComponentMeta<typeof BookPage>;

const Template: ComponentStory<typeof BookPage> = () => {
	return (
		<MemoryRouter initialEntries={["/books/b:1"]}>
			<Routes>
				<Route path={"/books/:bookId"} element={<BookPage />} />
			</Routes>
		</MemoryRouter>
	);
};

export const Default = Template.bind({});

function bookQueryMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: BOOK,
			variables: {
				id: "b:1",
			},
		},
		result: {
			data: {
				book: {
					id: "b:1",
					title: "A Book",
					author: {
						id: "a:1",
						firstName: "Demo",
						lastName: "User",
					},
				},
			},
		},
	};
}
