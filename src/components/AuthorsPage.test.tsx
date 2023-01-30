import { MockedResponse } from "@apollo/client/testing";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ADD_AUTHOR } from "src/graphql/mutations/author/addAuthor";
import { DELETE_AUTHOR } from "src/graphql/mutations/author/deleteAuthor";
import { AUTHOR } from "src/graphql/queries/author/author";
import { AUTHORS } from "src/graphql/queries/author/authors";
import { BOOK } from "src/graphql/queries/book/book";
import {
	renderWithApolloAndRouter,
	renderWithApolloAndRouterAndRoutes,
	wait,
} from "src/testUtils";
import { AuthorPage } from "./AuthorPage";
import { AuthorsPage } from "./AuthorsPage";
import { BookPage } from "./BookPage";

describe("AuthorsPage", () => {
	it("renders authors", async () => {
		// Given we are on the Authors Page
		renderWithApolloAndRouter({
			component: <AuthorsPage />,
			mocks: [authorsQueryOneAuthorWithBookMock],
			route: "/authors",
			path: "/authors",
		});

		// Then loading is displayed while the query is in flight
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When the query is resolved
		await wait();

		// Then the Author page title is displayed
		expect(screen.getByRole("heading")).toHaveTextContent("Authors");
		// and 1 author exists that has 1 book
		expect(screen.getByText("Demo User")).toBeInTheDocument();
		expect(screen.getByText("A Book")).toBeInTheDocument();
	});

	it("cannot create an author when invalid names provided", async () => {
		const user = userEvent.setup();

		// Given we are on the Authors Page
		renderWithApolloAndRouter({
			component: <AuthorsPage />,
			mocks: [authorsQueryOneAuthorWithBookMock],
			route: "/authors",
			path: "/authors",
		});

		// When the query is resolved
		await wait();
		// and create author button pressed
		await user.click(screen.getByText("Create Author"));

		// Then modal is displayed
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Create Author"
		);

		// When form fields are not filled in and create button is pressed
		await user.click(screen.getByText("Create"));

		// Then error messages are displayed
		expect(
			screen.getByText("Provided first name must not have spaces")
		).toBeInTheDocument();
		expect(
			screen.getByText("Provided last name must not have spaces")
		).toBeInTheDocument();

		// When modal close button pressed
		await user.click(screen.getByRole("button", { name: "Close" }));

		// Modal is closed
		expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

		// When create author button pressed
		await user.click(screen.getByText("Create Author"));

		// Then error messages have been removed
		expect(
			screen.queryByText("Provided first name must not have spaces")
		).not.toBeInTheDocument();
		expect(
			screen.queryByText("Provided last name must not have spaces")
		).not.toBeInTheDocument();

		// When first name and last name are filled in with spaces
		const firstNameInput = screen.getByRole("textbox", { name: "First Name" });
		const lastNameInput = screen.getByRole("textbox", { name: "Last Name" });
		await userEvent.type(firstNameInput, "Another Issue");
		await userEvent.type(lastNameInput, "With Name");
		// and create button is pressed
		await user.click(screen.getByText("Create"));

		// Then error messages are displayed
		expect(
			screen.getByText("Provided first name must not have spaces")
		).toBeInTheDocument();
		expect(
			screen.getByText("Provided last name must not have spaces")
		).toBeInTheDocument();
	});

	it("can create an author", async () => {
		const user = userEvent.setup();

		// Given we are on the Authors Page
		renderWithApolloAndRouter({
			component: <AuthorsPage />,
			mocks: [
				authorsQueryOneAuthorWithBookDynamicAddAuthorMock,
				addAuthorMutationMock,
			],
			route: "/authors",
			path: "/authors",
		});

		// When the query is resolved
		await wait();

		// Then there is only 1 author
		expect(screen.getAllByTestId("authors-page-author").length).toEqual(1);

		// When create author button pressed
		await user.click(screen.getByText("Create Author"));

		// Then modal is displayed
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Create Author"
		);
		// When first name and last name are filled in with no spaces
		const firstNameInput = screen.getByRole("textbox", { name: "First Name" });
		const lastNameInput = screen.getByRole("textbox", { name: "Last Name" });
		await userEvent.type(firstNameInput, "Another");
		await userEvent.type(lastNameInput, "Person");
		// and create button is pressed
		await user.click(screen.getByText("Create"));
		// and mutation resolves
		await wait();
		// and modal closed
		await wait();

		// Then author is created
		expect(screen.getAllByTestId("authors-page-author").length).toEqual(2);
		expect(screen.getByText("Another Person")).toBeInTheDocument();
	});
	it("renders error when there are filter errors", async () => {
		const user = userEvent.setup();

		// Given we are on the Authors Page and there are 3 authors
		renderWithApolloAndRouter({
			component: <AuthorsPage />,
			mocks: [authorsQueryThreeAuthorsNoBooksMock, authorsQueryFilterErrorMock],
			route: "/authors",
			path: "/authors",
		});

		// When the query is resolved
		await wait();

		// Then there are 3 authors displayed
		expect(screen.getByText("Demo User")).toBeInTheDocument();
		expect(screen.getByText("Another Example")).toBeInTheDocument();
		expect(screen.getByText("Cool Person")).toBeInTheDocument();

		// When we filter by first name
		const firstNameFilter = screen.getByTestId(
			"authors-page-filter-first-name"
		);
		await user.click(firstNameFilter);
		// and select an author
		await userEvent.selectOptions(firstNameFilter, "Cool");
		// and query resolves
		await wait();

		// Then error is displayed
		expect(screen.getByText("Error filtering authors")).toBeInTheDocument();
	});

	it("can filter by first name", async () => {
		const user = userEvent.setup();

		// Given we are on the Authors Page and there are 3 authors
		renderWithApolloAndRouter({
			component: <AuthorsPage />,
			mocks: [
				authorsQueryThreeAuthorsNoBooksMock,
				authorsQueryFirstNameFilterMock,
			],
			route: "/authors",
			path: "/authors",
		});

		// When the query is resolved
		await wait();

		// Then there are 3 authors displayed
		expect(screen.getByText("Demo User")).toBeInTheDocument();
		expect(screen.getByText("Another Example")).toBeInTheDocument();
		expect(screen.getByText("Cool Person")).toBeInTheDocument();

		// When we filter by first name
		const firstNameFilter = screen.getByTestId(
			"authors-page-filter-first-name"
		);
		await user.click(firstNameFilter);
		// and select an author
		await userEvent.selectOptions(firstNameFilter, "Cool");
		// and query resolves
		await wait();

		// Then only one author is displayed
		expect(screen.getByText("Cool Person")).toBeInTheDocument();
		// and the other 2 authors are not displayed
		expect(screen.queryByText("Demo User")).not.toBeInTheDocument();
		expect(screen.queryByText("Another Example")).not.toBeInTheDocument();

		// When we filter by first name
		await user.click(firstNameFilter);
		// and the empty value option is chosen
		await userEvent.selectOptions(firstNameFilter, "");

		// Then filter is reset and all authors are displayed
		expect(screen.getByText("Demo User")).toBeInTheDocument();
		expect(screen.getByText("Another Example")).toBeInTheDocument();
		expect(screen.getByText("Cool Person")).toBeInTheDocument();
	});

	it("can filter by last name", async () => {
		const user = userEvent.setup();

		// Given we are on the Authors Page and there are 3 authors
		renderWithApolloAndRouter({
			component: <AuthorsPage />,
			mocks: [
				authorsQueryThreeAuthorsNoBooksMock,
				authorsQueryLastNameFilterMock,
			],
			route: "/authors",
			path: "/authors",
		});

		// When the query is resolved
		await wait();

		// Then there are 3 authors displayed
		expect(screen.getByText("Demo User")).toBeInTheDocument();
		expect(screen.getByText("Another Example")).toBeInTheDocument();
		expect(screen.getByText("Cool Person")).toBeInTheDocument();

		// When we filter by last name
		const lastNameFilter = screen.getByTestId("authors-page-filter-last-name");
		await user.click(lastNameFilter);
		// and select an author
		await userEvent.selectOptions(lastNameFilter, "Person");
		// and query resolves
		await wait();

		// Then only one author is displayed
		expect(screen.getByText("Cool Person")).toBeInTheDocument();
		// and the other 2 authors are not displayed
		expect(screen.queryByText("Demo User")).not.toBeInTheDocument();
		expect(screen.queryByText("Another Example")).not.toBeInTheDocument();

		// When we filter by last name
		await user.click(lastNameFilter);
		// and the empty value option is chosen
		await userEvent.selectOptions(lastNameFilter, "");

		// Then filter is reset and all authors are displayed
		expect(screen.getByText("Demo User")).toBeInTheDocument();
		expect(screen.getByText("Another Example")).toBeInTheDocument();
		expect(screen.getByText("Cool Person")).toBeInTheDocument();
	});

	it("renders error when there are sort errors", async () => {
		const user = userEvent.setup();

		// Given we are on the Authors Page and there are 3 authors
		renderWithApolloAndRouter({
			component: <AuthorsPage />,
			mocks: [
				authorsQueryThreeAuthorsNoBooksMock,
				authorsQuerySortFilterErrorMock,
			],
			route: "/authors",
			path: "/authors",
		});

		// When the query is resolved
		await wait();

		// Then there are 3 authors
		const displayedAuthors = screen.getAllByTestId("authors-page-author");
		expect(displayedAuthors.length).toEqual(3);

		// When we filter by sort
		const sortFilter = screen.getByTestId("authors-page-filter-sort");
		await user.click(sortFilter);
		// and select desc
		await userEvent.selectOptions(sortFilter, "Desc");
		// and query resolves
		await wait();

		// Then error is displayed
		expect(screen.getByText("Error sorting authors")).toBeInTheDocument();
	});

	it("can sort authors by id", async () => {
		const user = userEvent.setup();

		// Given we are on the Authors Page and there are 3 authors
		renderWithApolloAndRouter({
			component: <AuthorsPage />,
			mocks: [authorsQueryThreeAuthorsNoBooksMock, authorsQuerySortFilterMock],
			route: "/authors",
			path: "/authors",
		});

		// When the query is resolved
		await wait();

		// Then there are 3 authors displayed in the following order
		const displayedAuthors = screen.getAllByTestId("authors-page-author");
		expect(displayedAuthors.length).toEqual(3);
		expect(displayedAuthors[0]).toHaveTextContent("Demo User");
		expect(displayedAuthors[1]).toHaveTextContent("Another Example");
		expect(displayedAuthors[2]).toHaveTextContent("Cool Person");

		// When we filter by sort
		const sortFilter = screen.getByTestId("authors-page-filter-sort");
		await user.click(sortFilter);
		// and select desc
		await userEvent.selectOptions(sortFilter, "Desc");
		// and query resolves
		await wait();

		// Then there are 3 authors displayed in the reverse order
		const displayedDescAuthors = screen.getAllByTestId("authors-page-author");
		expect(displayedDescAuthors.length).toEqual(3);
		expect(displayedDescAuthors[0]).toHaveTextContent("Cool Person");
		expect(displayedDescAuthors[1]).toHaveTextContent("Another Example");
		expect(displayedDescAuthors[2]).toHaveTextContent("Demo User");
	});

	it("can navigate to an author", async () => {
		const user = userEvent.setup();

		// Given we are on the Authors Page
		renderWithApolloAndRouterAndRoutes({
			components: [<AuthorsPage />, <AuthorPage />],
			initialRoute: "/authors",
			mocks: [authorsQueryOneAuthorWithBookMock, authorQueryMock],
			paths: ["/authors", "authors/:authorId"],
		});

		// When the query is resolved
		await wait();

		// Then there is 1 author
		const displayedAuthors = screen.getAllByTestId("authors-page-author");
		expect(displayedAuthors.length).toEqual(1);
		// with an author link and book link
		const authorLinks = within(displayedAuthors[0]).getAllByRole("link");
		const authorLink = authorLinks[0];
		expect(authorLink.getAttribute("href")).toEqual("/authors/a:1");

		// When author link pressed
		await user.click(authorLink);

		// Then user is navigated to the author page
		expect(screen.getByText("...loading")).toBeInTheDocument();

		// When author query is resolved
		await wait();

		// Then author data is displayed
		expect(screen.getByText("Demo User")).toBeInTheDocument();
	});

	it("can navigate to a book", async () => {
		const user = userEvent.setup();

		// Given we are on the Authors Page
		renderWithApolloAndRouterAndRoutes({
			components: [<AuthorsPage />, <BookPage />],
			initialRoute: "/authors",
			mocks: [authorsQueryOneAuthorWithBookMock, bookQueryMock],
			paths: ["/authors", "/books/:bookId"],
		});

		// When the query is resolved
		await wait();

		// Then there is 1 author
		const displayedAuthors = screen.getAllByTestId("authors-page-author");
		expect(displayedAuthors.length).toEqual(1);
		// with an author link and book link
		const authorLinks = within(displayedAuthors[0]).getAllByRole("link");
		const bookLink = authorLinks[1];
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

	it("can delete an author", async () => {
		const user = userEvent.setup();

		// Given we are on the Authors Page
		renderWithApolloAndRouterAndRoutes({
			components: [<AuthorsPage />, <BookPage />],
			initialRoute: "/authors",
			mocks: [
				authorsQueryOneAuthorWithBookDynamicDeleteAuthorMock,
				deleteAuthorMock,
			],
			paths: ["/authors", "/books/:bookId"],
		});

		// When the query is resolved
		await wait();

		// Then there is 1 author
		const displayedAuthors = screen.getAllByTestId("authors-page-author");
		expect(displayedAuthors.length).toEqual(1);

		// When delete button is pressed
		await user.click(screen.getByText("Delete"));

		// Then modal is displayed
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Delete Demo User"
		);

		// When modal continue button pressed
		await user.click(screen.getByText("Continue"));

		// Then confirmation modal displayed
		expect(
			screen.getByText(/You are about to delete this author/i)
		).toBeInTheDocument();

		// When modal delete author button is pressed
		await user.click(screen.getByText("Delete Author"));
		// and mutation resolves
		await wait();

		// Then modal is closed
		expect(
			screen.queryByText(/You are about to delete this author/i)
		).not.toBeInTheDocument();

		await wait();

		// and author no longer exists
		const displayedAuthorsAgain = screen.queryAllByTestId(
			"authors-page-author"
		);
		expect(displayedAuthorsAgain.length).toEqual(0);
	});
});

const authorsQueryOneAuthorWithBookMock: Readonly<MockedResponse> = {
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
					fullName: "Demo User",
					books: [
						{
							id: "b:1",
							title: "A Book",
							author: { id: "a:1" },
						},
					],
				},
			],
		},
	},
};

let authorsQueryOneAuthorWithBookDynamicAddAuthorMockCalled = false;
const authorsQueryOneAuthorWithBookDynamicAddAuthorMock: Readonly<MockedResponse> =
	{
		request: {
			query: AUTHORS,
			variables: { filter: {} },
		},
		newData: () => {
			if (!authorsQueryOneAuthorWithBookDynamicAddAuthorMockCalled) {
				authorsQueryOneAuthorWithBookDynamicAddAuthorMockCalled = true;
				return {
					data: {
						authors: [
							{
								id: "a:1",
								firstName: "Demo",
								lastName: "User",
								fullName: "Demo User",
								books: [
									{
										id: "b:1",
										title: "A Book",
										author: { id: "a:1" },
									},
								],
							},
						],
					},
				};
			}
			return {
				data: {
					authors: [
						{
							id: "a:1",
							firstName: "Demo",
							lastName: "User",
							fullName: "Demo User",
							books: [
								{
									id: "b:1",
									title: "A Book",
									author: { id: "a:1" },
								},
							],
						},
						{
							id: "a:2",
							firstName: "Another",
							lastName: "Person",
							fullName: "Another Person",
							books: [],
						},
					],
				},
			};
		},
	};

let authorsQueryOneAuthorWithBookDynamicDeleteAuthorMockCalled = false;
const authorsQueryOneAuthorWithBookDynamicDeleteAuthorMock: Readonly<MockedResponse> =
	{
		request: {
			query: AUTHORS,
			variables: { filter: {} },
		},
		newData: () => {
			if (!authorsQueryOneAuthorWithBookDynamicDeleteAuthorMockCalled) {
				authorsQueryOneAuthorWithBookDynamicDeleteAuthorMockCalled = true;
				return {
					data: {
						authors: [
							{
								id: "a:1",
								firstName: "Demo",
								lastName: "User",
								fullName: "Demo User",
								books: [
									{
										id: "b:1",
										title: "A Book",
										author: { id: "a:1" },
									},
								],
							},
						],
					},
				};
			}
			return {
				data: {
					authors: [],
				},
			};
		},
	};

const authorsQueryThreeAuthorsNoBooksMock: Readonly<MockedResponse> = {
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
					fullName: "Demo User",
					books: [],
				},
				{
					id: "a:2",
					firstName: "Another",
					lastName: "Example",
					fullName: "Another Example",
					books: [],
				},
				{
					id: "a:3",
					firstName: "Cool",
					lastName: "Person",
					fullName: "Cool Person",
					books: [],
				},
			],
		},
	},
};

const authorsQueryFirstNameFilterMock: Readonly<MockedResponse> = {
	request: {
		query: AUTHORS,
		variables: { filter: { firstName: ["Cool"] } },
	},
	result: {
		data: {
			authors: [
				{
					id: "a:3",
					firstName: "Cool",
					lastName: "Person",
					fullName: "Cool Person",
					books: [],
				},
			],
		},
	},
};

const authorsQueryLastNameFilterMock: Readonly<MockedResponse> = {
	request: {
		query: AUTHORS,
		variables: { filter: { lastName: ["Person"] } },
	},
	result: {
		data: {
			authors: [
				{
					id: "a:3",
					firstName: "Cool",
					lastName: "Person",
					fullName: "Cool Person",
					books: [],
				},
			],
		},
	},
};

const authorsQuerySortFilterMock: Readonly<MockedResponse> = {
	request: {
		query: AUTHORS,
		variables: { filter: {}, sortBy: "DESC" },
	},
	result: {
		data: {
			authors: [
				{
					id: "a:3",
					firstName: "Cool",
					lastName: "Person",
					fullName: "Cool Person",
					books: [],
				},
				{
					id: "a:2",
					firstName: "Another",
					lastName: "Example",
					fullName: "Another Example",
					books: [],
				},
				{
					id: "a:1",
					firstName: "Demo",
					lastName: "User",
					fullName: "Demo User",
					books: [],
				},
			],
		},
	},
};

const addAuthorMutationMock: Readonly<MockedResponse> = {
	request: {
		query: ADD_AUTHOR,
		variables: { input: { firstName: "Another", lastName: "Person" } },
	},
	result: {
		data: {
			addAuthor: {
				id: "a:1",
				firstName: "Another",
				lastName: "Person",
			},
		},
	},
};

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

const deleteAuthorMock: Readonly<MockedResponse> = {
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

const authorsQueryFilterErrorMock: Readonly<MockedResponse> = {
	request: {
		query: AUTHORS,
		variables: { filter: { firstName: ["Cool"] } },
	},
	error: {
		name: "authorsQueryFilterErrorMock error",
		message: "Error filtering authors",
	},
};

const authorsQuerySortFilterErrorMock: Readonly<MockedResponse> = {
	request: {
		query: AUTHORS,
		variables: { filter: {}, sortBy: "DESC" },
	},
	error: {
		name: "authorsQuerySortFilterErrorMock error",
		message: "Error sorting authors",
	},
};
