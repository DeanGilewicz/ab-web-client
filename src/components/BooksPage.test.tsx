import { MockedResponse } from "@apollo/client/testing";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ADD_BOOK } from "src/graphql/mutations/book/addBook";
import { DELETE_BOOK } from "src/graphql/mutations/book/deleteBook";
import { BOOK } from "src/graphql/queries/book/book";
import { BOOKS } from "src/graphql/queries/book/books";
import {
	renderWithApolloAndRouter,
	renderWithApolloAndRouterAndRoutes,
	wait,
} from "src/testUtils";
import { BookPage } from "./BookPage";
import { BooksPage } from "./BooksPage";

describe("BooksPage", () => {
	it("displays error when books query fails", async () => {
		// Given we are on the Books Page
		renderWithApolloAndRouter({
			component: <BooksPage />,
			mocks: [booksQueryErrorMock],
			route: "/books",
			path: "/books",
		});

		// Then loading is displayed while the query is in flight
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When the query is resolved
		await wait();

		// Then error is displayed
		expect(screen.getByText("Error querying books")).toBeInTheDocument();
	});

	it("renders books", async () => {
		// Given we are on the Books Page
		renderWithApolloAndRouter({
			component: <BooksPage />,
			mocks: [booksQueryOneBookWithAuthorMock],
			route: "/books",
			path: "/books",
		});

		// Then loading is displayed while the query is in flight
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When the query is resolved
		await wait();

		// Then the Books page title is displayed
		expect(screen.getByRole("heading")).toHaveTextContent("Books");
		// and 1 book exists
		expect(screen.getByText("A Book")).toBeInTheDocument();
	});

	it("cannot create a book without a title", async () => {
		const user = userEvent.setup();

		// Given we are on the Books Page
		renderWithApolloAndRouter({
			component: <BooksPage />,
			mocks: [booksQueryOneBookWithAuthorMock],
			route: "/books",
			path: "/books",
		});

		// When the query is resolved
		await wait();
		// and create book button pressed
		await user.click(screen.getByText("Create Book"));

		// Then modal is displayed
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Create Book"
		);
		// and create button is disabled
		expect(screen.getByText("Create")).toBeDisabled();
	});

	it("can create a book", async () => {
		const user = userEvent.setup();

		// Given we are on the Books Page
		renderWithApolloAndRouter({
			component: <BooksPage />,
			mocks: [
				booksQueryOneBookWithAuthorDynamicAddBookMock,
				addBookMutationMock,
			],
			route: "/books",
			path: "/books",
		});

		// When the query is resolved
		await wait();

		// Then there is only 1 book
		expect(screen.getAllByTestId("books-page-book").length).toEqual(1);

		// When create book button pressed
		await user.click(screen.getByText("Create Book"));

		// Then modal is displayed
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Create Book"
		);

		// When title field is filled in
		const titleInput = screen.getByRole("textbox", { name: "Title" });
		await userEvent.type(titleInput, "Another Book");
		// and create button is pressed
		await user.click(screen.getByText("Create"));
		// and mutation resolves
		await wait();

		// Then modal is closed
		expect(
			screen.queryByRole("textbox", { name: "Title" })
		).not.toBeInTheDocument();
		// and book is created
		expect(screen.getAllByTestId("books-page-book").length).toEqual(2);
		expect(screen.getByText("Another Book")).toBeInTheDocument();
	});

	it("can navigate to a book", async () => {
		const user = userEvent.setup();

		// Given we are on the Books Page
		renderWithApolloAndRouterAndRoutes({
			components: [<BooksPage />, <BookPage />],
			initialRoute: "/books",
			mocks: [booksQueryOneBookWithAuthorMock, bookQueryMock],
			paths: ["/books", "/books/:bookId"],
		});

		// When the query is resolved
		await wait();

		// Then there is 1 author
		const displayedBooks = screen.getAllByTestId("books-page-book");
		expect(displayedBooks.length).toEqual(1);
		// with an author link and book link
		const bookLinks = within(displayedBooks[0]).getAllByRole("link");
		const bookLink = bookLinks[0];
		expect(bookLink.getAttribute("href")).toEqual("/books/b:1");

		// When book link pressed
		await user.click(bookLink);

		// Then user is navigated to the book page
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When book query is resolved
		await wait();

		// Then book data is displayed
		expect(screen.getByText("A Book")).toBeInTheDocument();
	});

	it("can delete a book", async () => {
		const user = userEvent.setup();

		// Given we are on the Books Page
		renderWithApolloAndRouter({
			component: <BooksPage />,
			mocks: [
				booksQueryOneBookWithAuthorDynamicDeleteBookMock,
				deleteBookMutationMock,
			],
			route: "/books",
			path: "/books",
		});

		// When the query is resolved
		await wait();

		// Then there is 1 author
		const displayedBooks = screen.getAllByTestId("books-page-book");
		expect(displayedBooks.length).toEqual(1);

		// When delete book button pressed
		const bookDeleteButton = within(displayedBooks[0]).getByRole("button");
		await user.click(bookDeleteButton);

		// Then modal is displayed
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Delete A Book"
		);

		// When modal continue button pressed
		await user.click(screen.getByText("Continue"));

		// Then confirmation modal displayed
		expect(
			screen.getByText(/You are about to delete this book/i)
		).toBeInTheDocument();

		// When modal delete book button is pressed
		await user.click(screen.getByText("Delete Book"));
		// and mutation resolves
		await wait();

		// Then modal is closed
		await wait();
		expect(
			screen.queryByText(/You are about to delete this book/i)
		).not.toBeInTheDocument();

		// and book no longer exists
		const displayedBooksAgain = screen.queryAllByTestId("books-page-book");
		expect(displayedBooksAgain.length).toEqual(0);
	});
});

const booksQueryErrorMock: Readonly<MockedResponse> = {
	request: {
		query: BOOKS,
	},
	error: {
		name: "booksQueryErrorMock error",
		message: "Error querying books",
	},
};

const booksQueryOneBookWithAuthorMock: Readonly<MockedResponse> = {
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

let booksQueryOneBookWithAuthorDynamicAddBookMockCalled = false;
const booksQueryOneBookWithAuthorDynamicAddBookMock: Readonly<MockedResponse> =
	{
		request: {
			query: BOOKS,
		},
		newData: () => {
			if (!booksQueryOneBookWithAuthorDynamicAddBookMockCalled) {
				booksQueryOneBookWithAuthorDynamicAddBookMockCalled = true;
				return {
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
				};
			}
			return {
				data: {
					books: [
						{
							id: "b:1",
							title: "A Book",
							author: {
								id: "a:1",
							},
						},
						{
							id: "b:2",
							title: "Another Book",
							author: {
								id: "a:1",
							},
						},
					],
				},
			};
		},
	};

const addBookMutationMock: Readonly<MockedResponse> = {
	request: {
		query: ADD_BOOK,
		variables: { input: { title: "Another Book" } },
	},
	result: {
		data: {
			addBook: {
				id: "b:2",
				title: "Another Book",
			},
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

const deleteBookMutationMock: Readonly<MockedResponse> = {
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

let booksQueryOneBookWithAuthorDynamicDeleteBookMockCalled = false;
const booksQueryOneBookWithAuthorDynamicDeleteBookMock: Readonly<MockedResponse> =
	{
		request: {
			query: BOOKS,
		},
		newData: () => {
			if (!booksQueryOneBookWithAuthorDynamicDeleteBookMockCalled) {
				booksQueryOneBookWithAuthorDynamicDeleteBookMockCalled = true;
				return {
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
				};
			}
			return {
				data: {
					books: [],
				},
			};
		},
	};
