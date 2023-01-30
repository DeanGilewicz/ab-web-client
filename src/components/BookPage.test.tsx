import { ApolloError } from "@apollo/client";
import { MockedResponse } from "@apollo/client/testing";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { REMOVE_BOOK_AUTHOR } from "src/graphql/mutations/book/removeBookAuthor";
import { UPDATE_BOOK } from "src/graphql/mutations/book/updateBook";
import { AUTHOR } from "src/graphql/queries/author/author";
import { AUTHORS } from "src/graphql/queries/author/authors";
import { BOOK } from "src/graphql/queries/book/book";
import {
	renderWithApolloAndRouter,
	renderWithApolloAndRouterAndRoutes,
	wait,
} from "src/testUtils";
import { AuthorPage } from "./AuthorPage";
import { BookPage } from "./BookPage";

describe("BookPage", () => {
	it("renders book", async () => {
		// Given we are on the Book Page
		renderWithApolloAndRouter({
			component: <BookPage />,
			mocks: [bookQueryMock],
			route: "/books/b:1",
			path: "/books/:bookId",
		});

		// Then loading is displayed while the query is in flight
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When the query is resolved
		await wait();

		// Then the book title is displayed
		expect(screen.getByText("A Book")).toBeInTheDocument();
	});

	it("can edit book", async () => {
		const user = userEvent.setup();

		// Given we are on the Book Page
		renderWithApolloAndRouter({
			component: <BookPage />,
			mocks: [bookQueryMock, updateBookMutationMock],
			route: "/books/b:1",
			path: "/books/:bookId",
		});

		// When the query is resolved
		await wait();
		// and we click the edit button
		await user.click(screen.getByText("Edit"));

		// Then the edit UI is rendered with the correct form input
		const titleInput = screen.getByRole("textbox", { name: "Title" });
		expect(titleInput).toHaveValue("A Book");

		// When title is updated
		await userEvent.type(titleInput, " Updated");
		// and the save button pressed (mutation payload correct)
		await user.click(screen.getByText("Save"));
		// and mutation resolved
		await wait();

		// Then the title is saved
		expect(screen.getByText("A Book Updated")).toBeInTheDocument();
	});

	it("can cancel from edit book", async () => {
		const user = userEvent.setup();

		// Given we are on the Book Page
		renderWithApolloAndRouter({
			component: <BookPage />,
			mocks: [bookQueryMock, updateBookMutationMock],
			route: "/books/b:1",
			path: "/books/:bookId",
		});

		// When the query is resolved
		await wait();
		// and we click the edit button
		await user.click(screen.getByText("Edit"));

		// Then the edit UI is rendered with the correct form input
		const titleInput = screen.getByRole("textbox", { name: "Title" });
		expect(titleInput).toHaveValue("A Book");

		// When title is updated
		await userEvent.type(titleInput, " Updated");
		// and the close button is pressed
		await userEvent.click(screen.getByText("Close"));

		// Then the title is not updated
		expect(screen.getByText("A Book")).toBeInTheDocument();
	});

	it("can navigate to an author", async () => {
		const user = userEvent.setup();

		// Given we are on the Book Page
		renderWithApolloAndRouterAndRoutes({
			components: [<BookPage />, <AuthorPage />],
			initialRoute: "/books/b:1",
			mocks: [bookQueryMock, authorQueryMock],
			paths: ["books/:bookId", "authors/:authorId"],
		});

		// When the query is resolved
		await wait();

		// Then book has an author link
		const authorContainerEl = screen.getByTestId("book-page-author");
		const authorLink = within(authorContainerEl).getByRole("link");
		expect(authorLink.getAttribute("href")).toEqual("/authors/a:1");
		// and when pressed
		await user.click(authorLink);

		// Then user is navigated to the author page
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When author query is resolved
		await wait();

		// Then author data is displayed
		expect(screen.getByText("Demo User")).toBeInTheDocument();
	});

	it("can remove author from book", async () => {
		const user = userEvent.setup();

		// Given we are on the Book Page
		renderWithApolloAndRouter({
			component: <BookPage />,
			mocks: [
				bookQueryMock,
				updateBookMutationMock,
				removeBookAuthorMutationMock,
			],
			route: "/books/b:1",
			path: "/books/:bookId",
		});

		// When the query is resolved
		await wait();
		// and remove author from book button pressed
		const authorContainerEl = screen.getByTestId("book-page-author");
		const authorButton = within(authorContainerEl).getByRole("button");
		await user.click(authorButton);

		// Then remove author from book modal is displayed
		expect(screen.getByText("Remove Demo User")).toBeInTheDocument();

		// When modal continue button is pressed
		await user.click(screen.getByText("Continue"));

		// Then confirmation modal displayed
		expect(
			screen.getByText(/You are about to remove this author from this book/i)
		).toBeInTheDocument();

		// When modal remove book button pressed
		await user.click(screen.getByText("Remove Author"));
		// and mutation resolves
		await wait();

		// Then modal is closed
		expect(
			screen.queryByText(/You are about to remove this author from this book/i)
		).not.toBeInTheDocument();

		await wait();

		// and author no longer exists for book
		/**
		 * Note: we aren't able to assert update in the DOM for author not existing
		 * since cache update is not triggering book page component re-render in test
		 */
	});

	it("cannot add author to book when no authors exist", async () => {
		const user = userEvent.setup();

		// Given we are on the Book Page
		renderWithApolloAndRouter({
			component: <BookPage />,
			mocks: [bookQueryNoAuthorMock, authorsQueryNoAuthorsMock],
			route: "/books/b:1",
			path: "/books/:bookId",
		});

		// When the query is resolved
		await wait();
		// and search books button is pressed
		await user.click(screen.getByText("Search Authors"));
		// and lazy query resolved
		await wait();

		// Then a message is displayed
		expect(screen.getByText("No authors available")).toBeInTheDocument();
	});

	it("can add author to book", async () => {
		const user = userEvent.setup();

		// Given we are on the Book Page
		renderWithApolloAndRouter({
			component: <BookPage />,
			mocks: [
				bookQueryNoAuthorMock,
				authorsQueryOneAuthorMock,
				updateBookMutationWithAuthorMock,
			],
			route: "/books/b:1",
			path: "/books/:bookId",
		});

		// When the query is resolved
		await wait();
		// and search books button is pressed since book does not have an author
		await user.click(screen.getByText("Search Authors"));
		// and lazy query resolved
		await wait();

		// Then an author is available to select in dropdown
		const dropdown = screen.getByTestId("dropdown-assign-author");
		expect(within(dropdown).getByText("-Assign Author-")).toBeInTheDocument();
		expect(within(dropdown).getByText("Demo User")).toBeInTheDocument();

		// When we attempt to select the author
		await userEvent.selectOptions(dropdown, "Demo User");

		// Then the author is selected
		const option: HTMLOptionElement = screen.getByRole("option", {
			name: "Demo User",
		});
		expect(option.selected).toBe(true);

		await wait();

		// Then book now has an author
		/**
		 * Note: even resolving updateBookMutationWithAuthorMock mutation
		 * does not update the DOM in this test so we are relying on the fact
		 * that the mutation with the correct payload was called
		 */
	});

	it("displays error when add author to book fails", async () => {
		const user = userEvent.setup();

		// Given we are on the Book Page
		renderWithApolloAndRouter({
			component: <BookPage />,
			mocks: [
				bookQueryNoAuthorMock,
				authorsQueryOneAuthorMock,
				updateBookMutationWithAuthorErrorMock,
			],
			route: "/books/b:1",
			path: "/books/:bookId",
		});

		// When the query is resolved
		await wait();
		// and search books button is pressed since book does not have an author
		await user.click(screen.getByText("Search Authors"));
		// and lazy query resolved
		await wait();

		// Then an author is available to select in dropdown
		const dropdown = screen.getByTestId("dropdown-assign-author");
		expect(within(dropdown).getByText("-Assign Author-")).toBeInTheDocument();
		expect(within(dropdown).getByText("Demo User")).toBeInTheDocument();

		// When we attempt to select the author
		await userEvent.selectOptions(dropdown, "Demo User");

		// Then an error is displayed
		expect(screen.getByText("Error adding author to book")).toBeInTheDocument();
	});

	it("displays error when book query fails", async () => {
		// Given we are on the Book Page
		renderWithApolloAndRouter({
			component: <BookPage />,
			mocks: [bookQueryErrorMock],
			route: "/books/b:1",
			path: "/books/:bookId",
		});

		// Then loading is displayed while the query is in flight
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When the query is resolved
		await wait();

		// Then error message is displayed
		expect(screen.getByText("Error querying book")).toBeInTheDocument();
	});

	it("displays graphQL error when book query fails", async () => {
		// Given we are on the Book Page
		renderWithApolloAndRouter({
			component: <BookPage />,
			mocks: [bookQueryErrorGraphQLMock],
			route: "/books/b:1",
			path: "/books/:bookId",
		});

		// Then loading is displayed while the query is in flight
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When the query is resolved
		await wait();

		// Then error message is displayed
		expect(screen.getByText("graphQL error")).toBeInTheDocument();
	});

	it("displays error when authors query fails", async () => {
		const user = userEvent.setup();

		// Given we are on the Book Page
		renderWithApolloAndRouter({
			component: <BookPage />,
			mocks: [bookQueryNoAuthorMock, authorsQueryErrorMock],
			route: "/books/b:1",
			path: "/books/:bookId",
		});

		// When the query is resolved
		await wait();
		// and search books button is pressed
		await user.click(screen.getByText("Search Authors"));
		// and lazy query resolved
		await wait();

		// Then error message is displayed
		expect(screen.getByText("Error querying authors")).toBeInTheDocument();
	});
});

const authorQueryMock: Readonly<MockedResponse> = {
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

const authorsQueryNoAuthorsMock: Readonly<MockedResponse> = {
	request: {
		query: AUTHORS,
		variables: { filter: {} },
	},
	result: {
		data: {
			authors: [],
		},
	},
};

const authorsQueryOneAuthorMock: Readonly<MockedResponse> = {
	request: {
		query: AUTHORS,
		variables: { filter: {} },
	},
	result: {
		data: {
			authors: [
				{
					id: "a:1",
					firstName: "Demo",
					lastName: "User",
					books: [],
				},
			],
		},
	},
};

const bookQueryMock: Readonly<MockedResponse> = {
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

const bookQueryNoAuthorMock: Readonly<MockedResponse> = {
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
				author: null,
			},
		},
	},
};

const updateBookMutationMock: Readonly<MockedResponse> = {
	request: {
		query: UPDATE_BOOK,
		variables: {
			input: {
				id: "b:1",
				title: "A Book Updated",
			},
		},
	},
	result: {
		data: {
			updateBook: {
				id: "b:1",
				title: "A Book Updated",
				author: null,
			},
		},
	},
};

const updateBookMutationWithAuthorMock: Readonly<MockedResponse> = {
	request: {
		query: UPDATE_BOOK,
		variables: {
			input: {
				id: "b:1",
				authorId: "a:1",
			},
		},
	},
	result: {
		data: {
			updateBook: {
				id: "b:1",
				title: "A Book",
				author: {
					id: "a:1",
					books: [{ id: "b:1" }],
				},
			},
		},
	},
};

const updateBookMutationWithAuthorErrorMock: Readonly<MockedResponse> = {
	request: {
		query: UPDATE_BOOK,
		variables: {
			input: {
				id: "b:1",
				authorId: "a:1",
			},
		},
	},
	error: {
		name: "updateBookMutationWithAuthorErrorMock error",
		message: "Error adding author to book",
	},
};

const removeBookAuthorMutationMock: Readonly<MockedResponse> = {
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

const bookQueryErrorMock: Readonly<MockedResponse> = {
	request: {
		query: BOOK,
		variables: {
			id: "b:1",
		},
	},
	error: {
		name: "bookQueryErrorMock error",
		message: "Error querying book",
	},
};

const authorsQueryErrorMock: Readonly<MockedResponse> = {
	request: {
		query: AUTHORS,
		variables: { filter: {} },
	},
	error: {
		name: "authorsQueryErrorMock error",
		message: "Error querying authors",
	},
};

const bookQueryErrorGraphQLMock: Readonly<
	MockedResponse & { error: ApolloError }
> = {
	request: {
		query: BOOK,
		variables: {
			id: "b:1",
		},
	},
	error: {
		name: "graphQL error",
		message: "graphQL error",
		graphQLErrors: [
			{
				name: "graphQL error",
				locations: [{ column: 123, line: 123 }],
				path: [""],
				nodes: [],
				source: undefined,
				positions: [],
				originalError: {
					name: "original error",
					message: "original error",
				},
				message: "graphQL error",
				extensions: { none: "" },
				toJSON: () => ({ message: "graphQL error" }),
				[Symbol.toStringTag]: "",
			},
		],
		clientErrors: [],
		networkError: null,
		extraInfo: "",
	},
};
