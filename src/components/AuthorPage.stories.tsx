import { MockedResponse } from "@apollo/client/testing";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { DELETE_AUTHOR_BOOKS } from "src/graphql/mutations/author/deleteAuthorBooks";
import { UPDATE_AUTHOR } from "src/graphql/mutations/author/updateAuthor";
import { AUTHOR } from "src/graphql/queries/author/author";
import { BOOKS } from "src/graphql/queries/book/books";
import { AuthorPage } from "./AuthorPage";

export default {
	title: "Page/Author",
	component: AuthorPage,
	parameters: {
		apolloClient: {
			mocks: [
				authorQueryMock(),
				updateAuthorMutationMock(),
				booksQueryMock(),
				updateAuthorMutationAssignBookMock(),
				deleteAuthorBooksMutationMock(),
			],
		},
	},
} as ComponentMeta<typeof AuthorPage>;

const Template: ComponentStory<typeof AuthorPage> = () => {
	return (
		<MemoryRouter initialEntries={["/authors/a:1"]}>
			<Routes>
				<Route path={"/authors/:authorId"} element={<AuthorPage />} />
			</Routes>
		</MemoryRouter>
	);
};

export const Default = Template.bind({});

function authorQueryMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: AUTHOR,
			variables: {
				id: "a:1",
			},
		},
		result: {
			data: {
				author: {
					id: "a:1",
					firstName: "Demo",
					lastName: "User",
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
		},
	};
}

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
						author: { id: "a:1" },
					},
					{
						id: "b:2",
						title: "Another Book",
						author: null,
					},
				],
			},
		},
	};
}

function updateAuthorMutationMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: UPDATE_AUTHOR,
			variables: { input: { id: "a:1", firstName: "Demo", lastName: "User" } },
		},
		result: {
			data: {
				updateAuthor: {
					id: "a:1",
					firstName: "Demo",
					lastName: "User",
					books: [
						{
							id: "b:1",
							title: "A Book",
							author: {
								id: "a:1",
								firstName: "Demo",
								lastName: "User",
							},
						},
					],
				},
			},
		},
	};
}

function updateAuthorMutationAssignBookMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: UPDATE_AUTHOR,
			variables: { input: { id: "a:1", bookIds: ["b:2"] } },
		},
		result: {
			data: {
				updateAuthor: {
					id: "a:1",
					firstName: "Demo",
					lastName: "User",
					books: [
						{
							id: "b:1",
							title: "A Book",
							author: {
								id: "a:1",
								firstName: "Demo",
								lastName: "User",
							},
						},
						{
							id: "b:2",
							title: "Another Book",
							author: {
								id: "a:1",
								firstName: "Demo",
								lastName: "User",
							},
						},
					],
				},
			},
		},
	};
}

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
