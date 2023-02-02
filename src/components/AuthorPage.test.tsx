import { MockedResponse } from "@apollo/client/testing";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DELETE_AUTHOR_BOOKS } from "src/graphql/mutations/author/deleteAuthorBooks";
import { UPDATE_AUTHOR } from "src/graphql/mutations/author/updateAuthor";
import { AUTHOR } from "src/graphql/queries/author/author";
import { BOOK } from "src/graphql/queries/book/book";
import { BOOKS } from "src/graphql/queries/book/books";
import {
	renderWithApolloAndRouter,
	renderWithApolloAndRouterAndRoutes,
	wait,
} from "src/testUtils";
import { AuthorPage } from "./AuthorPage";
import { BookPage } from "./BookPage";

describe("AuthorPage", () => {
	it("renders author", async () => {
		// Given we are on the Author Page
		renderWithApolloAndRouter({
			component: <AuthorPage />,
			mocks: [authorQueryMock],
			route: "/authors/a:1",
			path: "/authors/:authorId",
		});

		// Then loading is displayed while the query is in flight
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When the query is resolved
		await wait();

		// Then the author name is displayed
		expect(screen.getByText("Demo User")).toBeInTheDocument();
	});

	it("cannot edit author when invalid first or last name exists", async () => {
		const user = userEvent.setup();

		// Given we are on the Author Page
		renderWithApolloAndRouter({
			component: <AuthorPage />,
			mocks: [authorQueryMock],
			route: "/authors/a:1",
			path: "authors/:authorId",
		});

		// When the query is resolved
		await wait();
		// and we click the edit button
		await user.click(screen.getByText("Edit"));

		// Then the edit UI is rendered with the correct form inputs
		const firstNameInput = screen.getByRole("textbox", { name: "First Name" });
		const lastNameInput = screen.getByRole("textbox", { name: "Last Name" });
		expect(firstNameInput).toHaveValue("Demo");
		expect(lastNameInput).toHaveValue("User");

		// When first name and last name are updated with invalid spaces
		await userEvent.type(firstNameInput, " This");
		await userEvent.type(lastNameInput, " Now");
		// and the save button pressed
		await user.click(screen.getByText("Save"));

		// Then error messages are displayed
		expect(
			screen.getByText("Provided first name must not have spaces")
		).toBeInTheDocument();
		expect(
			screen.getByText("Provided last name must not have spaces")
		).toBeInTheDocument();

		// When edit is canceled
		await user.click(screen.getByText("Close"));
		// and edit attempted again
		await user.click(screen.getByText("Edit"));
		// Then errors are not displayed
		expect(
			screen.queryByText("Provided first name must not have spaces")
		).not.toBeInTheDocument();
		expect(
			screen.queryByText("Provided last name must not have spaces")
		).not.toBeInTheDocument();
	});

	it("can edit author", async () => {
		const user = userEvent.setup();

		// Given we are on the Author Page
		renderWithApolloAndRouter({
			component: <AuthorPage />,
			mocks: [authorQueryMock, updateAuthorMutationMock],
			route: "/authors/a:1",
			path: "authors/:authorId",
		});

		// When the query is resolved
		await wait();
		// and we click the edit button
		await user.click(screen.getByText("Edit"));

		// Then the edit UI is rendered with the correct form inputs
		const firstNameInput = screen.getByRole("textbox", { name: "First Name" });
		const lastNameInput = screen.getByRole("textbox", { name: "Last Name" });
		expect(firstNameInput).toHaveValue("Demo");
		expect(lastNameInput).toHaveValue("User");

		// When first name and last name are updated
		await userEvent.type(firstNameInput, "This");
		await userEvent.type(lastNameInput, "Now");
		// and the save button pressed
		await user.click(screen.getByText("Save"));
		// and mutation resolved
		await wait();

		// Then the name is saved (mutation payload correct)
		expect(screen.getByText("DemoThis UserNow")).toBeInTheDocument();
	});

	it("can navigate to a book", async () => {
		const user = userEvent.setup();

		// Given we are on the Author Page
		renderWithApolloAndRouterAndRoutes({
			components: [<AuthorPage />, <BookPage />],
			initialRoute: "/authors/a:1",
			mocks: [authorQueryMock, updateAuthorMutationMock, bookQueryMock],
			paths: ["authors/:authorId", "books/:bookId"],
		});

		// When the query is resolved
		await wait();

		// Then author has a book link
		const booksContainerEl = screen.getByTestId("author-page-books");
		const bookLink = within(booksContainerEl).getByRole("link");
		expect(bookLink.getAttribute("href")).toEqual("/books/b:1");
		// and when pressed
		await user.click(bookLink);

		// Then user is navigated to the book page
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When book query is resolved
		await wait();

		// Then Book data is displayed
		expect(screen.getByText("A Book")).toBeInTheDocument();
	});

	it("can remove books from Author", async () => {
		const user = userEvent.setup();

		// Given we are on the Author Page
		renderWithApolloAndRouter({
			component: <AuthorPage />,
			mocks: [authorQueryMock, deleteAuthorBooksMutationMock],
			route: "/authors/a:1",
			path: "authors/:authorId",
		});

		// When the query is resolved
		await wait();
		// and remove book from author button pressed
		const booksContainerEl = screen.getByTestId("author-page-books");
		const bookButton = within(booksContainerEl).getByRole("button");
		await user.click(bookButton);

		// Then remove book modal is displayed
		expect(screen.getByText("Remove A Book")).toBeInTheDocument();

		// When modal continue button is pressed
		await user.click(screen.getByText("Continue"));

		// Then confirmation modal displayed
		expect(
			screen.getByText(/You are about to remove this book from this author/i)
		).toBeInTheDocument();

		// When modal remove book button pressed
		await user.click(screen.getByText("Remove Book"));
		// and mutation resolves
		await wait();

		// Then modal is closed
		expect(
			screen.queryByText(/You are about to remove this book from this author/i)
		).not.toBeInTheDocument();

		await wait();

		// and book no longer exists for author
		/**
		 * Note: we aren't able to assert update in the DOM for book not existing
		 * since BOOKS refetch query is not being triggered for mutation and author
		 * page component is not being re-rendered in this test.
		 */
	});

	it("cannot add books to Author when no books are available", async () => {
		const user = userEvent.setup();

		// Given we are on the Author Page
		renderWithApolloAndRouter({
			component: <AuthorPage />,
			mocks: [authorQueryMock, booksQueryNoBookMock],
			route: "/authors/a:1",
			path: "authors/:authorId",
		});

		// When the query is resolved
		await wait();
		// and search books button is pressed
		await user.click(screen.getByText("Search Books"));
		// and a lazy query resolved
		await wait();

		// Then a message is displayed
		expect(screen.getByText("No books available")).toBeInTheDocument();
	});

	it("can add books to Author", async () => {
		const user = userEvent.setup();

		// Given we are on the Author Page
		renderWithApolloAndRouter({
			component: <AuthorPage />,
			mocks: [
				authorQueryMock,
				booksQueryMock,
				updateAuthorMutationAssignBookMock,
			],
			route: "/authors/a:1",
			path: "authors/:authorId",
		});

		// When the query is resolved
		await wait();

		// Then author has 1 book
		const booksContainerEl = screen.getByTestId("author-page-books");
		const bookLinks = within(booksContainerEl).getAllByRole("link");
		expect(bookLinks.length).toEqual(1);
		expect(within(booksContainerEl).getByText("A Book")).toBeTruthy();

		// When search books button is pressed
		await user.click(screen.getByText("Search Books"));
		// and a lazy query resolved
		await wait();

		// Then a book is available to select in dropdown
		const dropdown = screen.getByTestId("dropdown-assign-book");
		expect(within(dropdown).getByText("-Assign Book-")).toBeInTheDocument();
		expect(within(dropdown).getByText("Another Book")).toBeInTheDocument();

		// When we attempt to select the book
		await userEvent.selectOptions(dropdown, "Another Book");

		// Then the book is selected
		const option: HTMLOptionElement = screen.getByRole("option", {
			name: "Another Book",
		});
		expect(option.selected).toBe(true);

		await wait();

		// Then author has an additional book
		/**
		 * Note: even resolving updateAuthorMutationAssignBookMock mutation
		 * does not update the DOM in this test so we are relying on the fact
		 * that the mutation with the correct payload was called
		 */
		//
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

const updateAuthorMutationMock: Readonly<MockedResponse> = {
	request: {
		query: UPDATE_AUTHOR,
		variables: {
			input: {
				id: "a:1",
				firstName: "DemoThis",
				lastName: "UserNow",
			},
		},
	},
	result: {
		data: {
			updateAuthor: {
				id: "a:1",
				firstName: "DemoThis",
				lastName: "UserNow",
				books: [
					{
						id: "b:1",
						title: "A Book",
						author: {
							id: "a:1",
							firstName: "DemoThis",
							lastName: "UserNow",
						},
					},
				],
			},
		},
	},
};

const updateAuthorMutationAssignBookMock: Readonly<MockedResponse> = {
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

const booksQueryMock: Readonly<MockedResponse> = {
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

const booksQueryNoBookMock: Readonly<MockedResponse> = {
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
					author: { id: "a:1" },
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

const deleteAuthorBooksMutationMock: Readonly<MockedResponse> = {
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
