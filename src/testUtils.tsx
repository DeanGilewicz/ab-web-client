import { act, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { AlertContextProvider } from "./contexts/AlertContext";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import { ErrorContextProvider } from "./contexts/ErrorContext";
import { Author, Book, Mutation, Query } from "./generated/graphql-types";
import { Page } from "@playwright/test";

interface renderWithRouterProps {
	component: JSX.Element;
	route?: string;
}

export function renderWithRouter(props: renderWithRouterProps) {
	const { component, route = "/" } = props;
	return render(
		<MemoryRouter initialEntries={[route]}>{component}</MemoryRouter>
	);
}

interface renderWithApolloProps {
	component: JSX.Element;
	mocks: ReadonlyArray<MockedResponse>;
	path?: string;
}

// export function renderWithApollo(props: renderWithApolloProps) {
// 	const { component, mocks, path = "" } = props;
// 	return render(
// 		<MockedProvider mocks={mocks} addTypename={false}>
// 			<Route path={path}>{component}</Route>
// 		</MockedProvider>
// 	);
// }

export function renderWithApolloAndRouter(
	props: renderWithRouterProps & renderWithApolloProps
) {
	const { component, mocks, route = "/", path = "" } = props;
	return render(
		<MockedProvider mocks={mocks} addTypename={false}>
			<MemoryRouter initialEntries={[route]}>
				<ErrorContextProvider>
					<ErrorBoundary>
						<AlertContextProvider>
							<Routes>
								<Route path={path} element={component} />
							</Routes>
						</AlertContextProvider>
					</ErrorBoundary>
				</ErrorContextProvider>
			</MemoryRouter>
		</MockedProvider>
	);
}

interface renderWithApolloAndRouterAndRoutesProps {
	components: JSX.Element[];
	initialRoute?: string;
	mocks: ReadonlyArray<MockedResponse>;
	paths?: string[];
}

export function renderWithApolloAndRouterAndRoutes(
	props: renderWithApolloAndRouterAndRoutesProps
) {
	const { components, mocks, initialRoute = "/", paths = [""] } = props;
	return render(
		<MockedProvider mocks={mocks} addTypename={false}>
			<MemoryRouter initialEntries={[initialRoute]}>
				<Routes>
					{components.map((c, i) => (
						<Route path={paths[i]} element={c} key={i} />
					))}
				</Routes>
			</MemoryRouter>
		</MockedProvider>
	);
}

/**
 * We could use something like await screen.findByText (or find something)
 * to resolve query prior to searching for text but instead this helper
 * will resolve in-flight promises (next tick) in order to assert on data in DOM
 */
export async function wait() {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
}

/**
 * Helper for accessing DOM element outside of react-testing-library in storybook
 */
export function sbDomFindByText(
	rootEl: Element,
	selector: string,
	text: string
) {
	return Array.from(rootEl.querySelectorAll(selector)).find(
		(el) => el.textContent === text
	);
}

/**
 * Mocks for Playwright e2e tests
 */
type MockQueries = Omit<Query, "__typename" | "test">;
type MockMutations = Omit<Mutation, "__typename">;
type MockGql = MockQueries & MockMutations;

interface MockAuthorBookConfig {
	authorBook: number;
	authorOnly: number;
	bookAuthor: number;
	bookOnly: number;
}

type MockInstance = {
	[key in keyof Partial<MockGql>]: Record<number, MockAuthorBookConfig>;
};

const authorNames = [
	["Demo", "User"],
	["Test", "Person"],
	["Auto", "Human"],
];

const bookNames = [["A Book"], ["Test Magazine"], ["Auto Novel"]];

export const pageWithGraphQlMocks = async (
	page: Page,
	mockInstance: MockInstance
) => {
	let gqlCount: Record<keyof MockGql, number> = {
		addAuthor: 0,
		addBook: 0,
		author: 0,
		authors: 0,
		book: 0,
		books: 0,
		deleteAuthor: 0,
		deleteAuthorBooks: 0,
		deleteBook: 0,
		removeBookAuthor: 0,
		updateAuthor: 0,
		updateBook: 0,
	};

	await page.route("**/graphql", (route) => {
		const body: { operationName: string; variables: any; query: string } = route
			.request()
			.postDataJSON();
		const { operationName, query, variables } = body;
		const mockResponse = graphQlMockResponse(
			operationType(query),
			operationName,
			variables,
			gqlCount,
			mockInstance
		);
		return route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify(mockResponse),
		});
	});
	return page;
};

function operationType(query: string) {
	// e.g. matches Authors($filter: AuthorFilter!, $sortBy: AuthorSortType)
	const queryOp = /(?<=query\s).*(?=\s{)/;
	// e.g. matches deleteAuthor($input: AuthorDeleteInput!)
	const mutationOp = /(?<=mutation\s).*(?=\s\{)/;
	const queryMatch: string[] | null = query.match(queryOp);
	const mutationMatch: string[] | null = query.match(mutationOp);
	return queryMatch ? "query" : mutationMatch ? "mutation" : "unknown";
}

function graphQlMockResponse(
	operationType: string,
	operationName: string,
	variables: any,
	gqlCount: Record<keyof MockGql, number>,
	mockInstance: MockInstance
) {
	// console.log({
	// operationType,
	// operationName,
	// variables,
	// gqlCount,
	// mockInstance,
	// });

	switch (operationType) {
		case "query":
			switch (operationName) {
				case "Authors":
					switch (JSON.stringify(variables)) {
						case '{"filter":{}}':
							const authorsMock = mockInstance["authors"];
							const mock = authorsMock?.[gqlCount.authors];
							gqlCount.authors++;
							return authorsMockResponse(mock?.authorBook, mock?.authorOnly);
						case '{"filter":{"firstName":["Demo"]}}':
							const authorsFirstNameFilterMock = mockInstance["authors"];
							const firstNameFilterMock =
								authorsFirstNameFilterMock?.[gqlCount.authors];
							gqlCount.authors++;
							return authorsFirstNameFilterMockResponse(
								firstNameFilterMock?.authorBook,
								firstNameFilterMock?.authorOnly
							);
						case '{"filter":{"lastName":["User"]}}':
							const authorsLastNameFilterMock = mockInstance["authors"];
							const lastNameFilterMock =
								authorsLastNameFilterMock?.[gqlCount.authors];
							gqlCount.authors++;
							return authorsLastNameFilterMockResponse(
								lastNameFilterMock?.authorBook,
								lastNameFilterMock?.authorOnly
							);
						case '{"filter":{},"sortBy":"DESC"}':
							const authorsDescFilterMock = mockInstance["authors"];
							const descFilterMock = authorsDescFilterMock?.[gqlCount.authors];
							gqlCount.authors++;
							return authorsDescFilterMockResponse(
								descFilterMock?.authorBook,
								descFilterMock?.authorOnly
							);
						case '{"filter":{},"sortBy":"ASC"}':
							const authorsAscFilterMock = mockInstance["authors"];
							const ascFilterMock = authorsAscFilterMock?.[gqlCount.authors];
							gqlCount.authors++;
							return authorsAscFilterMockResponse(
								ascFilterMock?.authorBook,
								ascFilterMock?.authorOnly
							);
					}
					break;
				case "Author":
					switch (JSON.stringify(variables)) {
						case '{"id":"a:1"}':
							const authorMock = mockInstance["author"];
							const mock = authorMock?.[gqlCount.author];
							gqlCount.author++;
							return authorMockResponse(mock?.authorBook, mock?.authorOnly);
					}
					break;
				case "Books":
					switch (JSON.stringify(variables)) {
						case "{}":
							const booksMock = mockInstance["books"];
							const mock = booksMock?.[gqlCount.books];
							gqlCount.books++;
							return booksMockResponse(mock?.bookAuthor, mock?.bookOnly);
					}
					break;
				case "Book":
					switch (JSON.stringify(variables)) {
						case '{"id":"b:1"}':
							const bookMock = mockInstance["book"];
							const mock = bookMock?.[gqlCount.book];
							gqlCount.book++;
							return bookMockResponse(mock?.bookAuthor, mock?.bookOnly);
					}
					break;
			}
			break;
		case "mutation":
			switch (operationName) {
				case "addAuthor":
					switch (JSON.stringify(variables)) {
						case '{"input":{"firstName":"Demo","lastName":"User"}}':
							const addAuthorMock = mockInstance["addAuthor"];
							const mock = addAuthorMock?.[gqlCount.addAuthor];
							gqlCount.addAuthor++;
							return addAuthorMockResponse(mock?.authorBook, mock?.authorOnly);
					}
					break;
				case "updateAuthor":
					switch (JSON.stringify(variables)) {
						case '{"input":{"id":"a:1","firstName":"Test","lastName":"Person"}}':
							const updateAuthorMock = mockInstance["updateAuthor"];
							const mock = updateAuthorMock?.[gqlCount.updateAuthor];
							gqlCount.updateAuthor++;
							return updateAuthorMockResponse(
								mock?.authorBook,
								mock?.authorOnly
							);
					}
					break;
				case "deleteAuthor":
					switch (JSON.stringify(variables)) {
						case '{"input":{"id":"a:1"}}':
							const deleteAuthorMock = mockInstance["deleteAuthor"];
							const mock = deleteAuthorMock?.[gqlCount.deleteAuthor];
							gqlCount.deleteAuthor++;
							return deleteAuthorMockResponse(
								mock?.authorBook,
								mock?.authorOnly
							);
					}
					break;
				case "deleteAuthorBooks":
					switch (JSON.stringify(variables)) {
						case '{"input":{"id":"a:1","bookIds":["b:1"]}}':
							const deleteAuthorBooksMock = mockInstance["deleteAuthorBooks"];
							const mock = deleteAuthorBooksMock?.[gqlCount.deleteAuthorBooks];
							gqlCount.deleteAuthorBooks++;
							return deleteAuthorBooksMockResponse(
								mock?.authorBook,
								mock?.authorOnly
							);
					}
					break;
				case "addBook":
					switch (JSON.stringify(variables)) {
						case '{"input":{"title":"A Book"}}':
							const addBookMock = mockInstance["addBook"];
							const mock = addBookMock?.[gqlCount.addBook];
							gqlCount.addBook++;
							return addBookMockResponse(mock?.bookAuthor, mock?.bookOnly);
					}
					break;
				case "updateBook":
					switch (JSON.stringify(variables)) {
						case '{"input":{"id":"b:1","title":"Test Magazine"}}':
							const updateBookMock = mockInstance["updateBook"];
							const mock = updateBookMock?.[gqlCount.updateBook];
							gqlCount.updateBook++;
							return updateBookMockResponse(mock?.bookAuthor, mock?.bookOnly);
					}
					break;
				case "deleteBook":
					switch (JSON.stringify(variables)) {
						case '{"input":{"id":"b:1"}}':
							const deleteBookMock = mockInstance["deleteBook"];
							const mock = deleteBookMock?.[gqlCount.deleteBook];
							gqlCount.deleteBook++;
							return deleteBookMockResponse(mock?.bookAuthor, mock?.bookOnly);
					}
					break;
				case "removeBookAuthor":
					switch (JSON.stringify(variables)) {
						case '{"input":{"id":"b:1"}}':
							const removeBookAuthorMock = mockInstance["removeBookAuthor"];
							const mock = removeBookAuthorMock?.[gqlCount.removeBookAuthor];
							gqlCount.removeBookAuthor++;
							return removeBookAuthorMockResponse(
								mock?.bookAuthor,
								mock?.bookOnly
							);
					}
					break;
			}
			break;
		default:
			throw new Error("Unrecognized operationType!");
	}
}

function authorsMockResponse(
	authorBook: number | undefined,
	authorOnly: number | undefined
) {
	const authorsBooksMock = Array.from(Array(authorBook ?? 0)).map((_, i) => {
		const [firstName, lastName] = authorNames[i];
		const [bookTitle] = bookNames[i];
		const authorsBooks: Omit<Author, "books"> & {
			books: { id: string; title: string; author: { id: string } }[];
		} = {
			id: `a:${i + 1}`,
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
			books: [
				{
					id: `b:${i + 1}`,
					title: bookTitle,
					author: { id: `a:${i + 1}` },
				},
			],
		};
		return authorsBooks;
	});

	const authorsMock = Array.from(Array(authorOnly ?? 0)).map((_, i) => {
		const [firstName, lastName] = authorNames[i];
		const author: Omit<Author, "books"> = {
			id: `a:${i + 1}`,
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
		};
		return author;
	});

	return { data: { authors: [...authorsBooksMock, ...authorsMock] } };
}

function authorMockResponse(
	authorBook: number | undefined,
	authorOnly: number | undefined
) {
	if (authorBook && authorOnly) {
		throw new Error("You can only use authorBook or authorOnly");
	}
	const [firstName, lastName] = authorNames[0];
	const [bookTitle] = bookNames[0];
	if (authorBook) {
		const authorBooksMock: Omit<Author, "books"> & {
			books: { id: string; title: string; author: { id: string } }[];
		} = {
			id: "a:1",
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
			books: [
				{
					id: "b:1",
					title: bookTitle,
					author: { id: "a:1" },
				},
			],
		};
		return { data: { author: authorBooksMock } };
	}

	const author: Omit<Author, "books"> = {
		id: "a:1",
		firstName,
		lastName,
		fullName: `${firstName} ${lastName}`,
	};
	return { data: { author } };
}

function authorsFirstNameFilterMockResponse(
	authorBook: number | undefined,
	authorOnly: number | undefined
) {
	const authorsBooksMock = Array.from(Array(authorBook ?? 0)).map((_, i) => {
		const [firstName, lastName] = authorNames[i];
		const [bookTitle] = bookNames[i];
		const authorsBooks: Omit<Author, "books"> & {
			books: { id: string; title: string; author: { id: string } }[];
		} = {
			id: `a:${i + 1}`,
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
			books: [
				{
					id: `b:${i + 1}`,
					title: bookTitle,
					author: { id: `a:${i + 1}` },
				},
			],
		};
		return authorsBooks;
	});

	const authorsMock = Array.from(Array(authorOnly ?? 0)).map((_, i) => {
		const [firstName, lastName] = authorNames[i];
		const author: Omit<Author, "books"> = {
			id: `a:${i + 1}`,
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
		};
		return author;
	});
	return { data: { authors: [...authorsBooksMock, ...authorsMock] } };
}

function authorsLastNameFilterMockResponse(
	authorBook: number | undefined,
	authorOnly: number | undefined
) {
	const authorsBooksMock = Array.from(Array(authorBook ?? 0)).map((_, i) => {
		const [firstName, lastName] = authorNames[i];
		const [bookTitle] = bookNames[i];
		const authorsBooks: Omit<Author, "books"> & {
			books: { id: string; title: string; author: { id: string } }[];
		} = {
			id: `a:${i + 1}`,
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
			books: [
				{
					id: `b:${i + 1}`,
					title: bookTitle,
					author: { id: `a:${i + 1}` },
				},
			],
		};
		return authorsBooks;
	});

	const authorsMock = Array.from(Array(authorOnly ?? 0)).map((_, i) => {
		const [firstName, lastName] = authorNames[i];
		const author: Omit<Author, "books"> = {
			id: `a:${i + 1}`,
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
		};
		return author;
	});
	return { data: { authors: [...authorsBooksMock, ...authorsMock] } };
}

function authorsDescFilterMockResponse(
	authorBook: number | undefined,
	authorOnly: number | undefined
) {
	const authorsBooksMock = Array.from(Array(authorBook ?? 0)).map((_, i) => {
		const [firstName, lastName] = authorNames[i];
		const [bookTitle] = bookNames[i];
		const authorsBooks: Omit<Author, "books"> & {
			books: { id: string; title: string; author: { id: string } }[];
		} = {
			id: `a:${i + 1}`,
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
			books: [
				{
					id: `b:${i + 1}`,
					title: bookTitle,
					author: { id: `a:${i + 1}` },
				},
			],
		};
		return authorsBooks;
	});

	const authorsMock = Array.from(Array(authorOnly ?? 0)).map((_, i) => {
		const [firstName, lastName] = authorNames[i];
		const author: Omit<Author, "books"> = {
			id: `a:${i + 1}`,
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
		};
		return author;
	});

	const allAuthors = [...authorsBooksMock, ...authorsMock];
	return { data: { authors: allAuthors.reverse() } };
}

function authorsAscFilterMockResponse(
	authorBook: number | undefined,
	authorOnly: number | undefined
) {
	const authorsBooksMock = Array.from(Array(authorBook ?? 0)).map((_, i) => {
		const [firstName, lastName] = authorNames[i];
		const [bookTitle] = bookNames[i];
		const authorsBooks: Omit<Author, "books"> & {
			books: { id: string; title: string; author: { id: string } }[];
		} = {
			id: `a:${i + 1}`,
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
			books: [
				{
					id: `b:${i + 1}`,
					title: bookTitle,
					author: { id: `a:${i + 1}` },
				},
			],
		};
		return authorsBooks;
	});

	const authorsMock = Array.from(Array(authorOnly ?? 0)).map((_, i) => {
		const [firstName, lastName] = authorNames[i];
		const author: Omit<Author, "books"> = {
			id: `a:${i + 1}`,
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
		};
		return author;
	});
	return { data: { authors: [...authorsBooksMock, ...authorsMock] } };
}

function addAuthorMockResponse(
	authorBook: number | undefined,
	authorOnly: number | undefined
) {
	if (authorBook) {
		throw new Error("authorBook is not allowed");
	}
	const [firstName, lastName] = authorNames[0];
	const author: Omit<Author, "books" | "fullName"> = {
		id: "a:1",
		firstName,
		lastName,
	};
	return { data: { addAuthor: author } };
}

function updateAuthorMockResponse(
	authorBook: number | undefined,
	authorOnly: number | undefined
) {
	if (authorBook && authorOnly) {
		throw new Error(
			"authorBook and authorOnly cannot both have non-zero values"
		);
	}
	const [firstName, lastName] = authorNames[1];
	const [bookTitle] = bookNames[0];
	if (authorBook) {
		const authorBookMock: Omit<Author, "books" | "fullName"> & {
			books: {
				id: string;
				title: string;
				author: { id: string; firstName: string; lastName: string };
			}[];
		} = {
			id: "a:1",
			firstName: "Test",
			lastName: "Person",
			books: [
				{
					id: "b:1",
					title: bookTitle,
					author: {
						id: "a:1",
						firstName,
						lastName,
					},
				},
			],
		};
		return { data: { updateAuthor: authorBookMock } };
	}

	const authorMock: Omit<Author, "books" | "fullName"> = {
		id: "a:1",
		firstName: "Test",
		lastName: "Person",
	};
	return { data: { updateAuthor: authorMock } };
}

function deleteAuthorMockResponse(
	authorBook: number | undefined,
	authorOnly: number | undefined
) {
	if (authorBook && authorOnly) {
		throw new Error(
			"authorBook and authorOnly cannot both have non-zero values"
		);
	}
	return { data: { deleteAuthor: { id: "a:1" } } };
}

function deleteAuthorBooksMockResponse(
	authorBook: number | undefined,
	authorOnly: number | undefined
) {
	const authorMock: Omit<Author, "fullName"> = {
		id: "a:1",
		firstName: "Demo",
		lastName: "User",
		books: [],
	};
	return { data: { deleteAuthorBooks: authorMock } };
}

function booksMockResponse(
	bookAuthor: number | undefined,
	bookOnly: number | undefined
) {
	const booksAuthorMock = Array.from(Array(bookAuthor ?? 0)).map((_, i) => {
		const [bookTitle] = bookNames[i];
		const booksAuthor: Omit<Book, "author"> & { author: { id: string } } = {
			id: `b:${i + 1}`,
			title: bookTitle,
			author: {
				id: `a:${i + 1}`,
			},
		};
		return booksAuthor;
	});

	const booksMock = Array.from(Array(bookOnly ?? 0)).map((_, i) => {
		const [bookTitle] = bookNames[i];
		const book: Omit<Book, "author"> = {
			id: `b:${i + 1}`,
			title: bookTitle,
		};
		return book;
	});

	return { data: { books: [...booksAuthorMock, ...booksMock] } };
}

function addBookMockResponse(
	bookAuthor: number | undefined,
	bookOnly: number | undefined
) {
	if (bookAuthor && bookOnly) {
		throw new Error("bookAuthor and bookOnly cannot both have non-zero values");
	}
	if (bookAuthor) {
		const bookAuthorMock: Omit<Book, "author"> & {
			author: { id: string; firstName: string; lastName: string };
		} = {
			id: "b:1",
			title: bookNames[0][0],
			author: {
				id: "a:1",
				firstName: "Demo",
				lastName: "User",
			},
		};
		return { data: { addBook: bookAuthorMock } };
	}
	const authorMock: Omit<Book, "author"> = {
		id: "b:1",
		title: bookNames[0][0],
	};

	return { data: { addBook: authorMock } };
}

function bookMockResponse(
	bookAuthor: number | undefined,
	bookOnly: number | undefined
) {
	if (bookAuthor && bookOnly) {
		throw new Error("You can only use bookAuthor or bookOnly");
	}
	const [firstName, lastName] = authorNames[0];
	const [bookTitle] = bookNames[0];
	if (bookAuthor) {
		const bookAuthorMock: Omit<Book, "author"> & {
			author: { id: string; firstName: string; lastName: string };
		} = {
			id: "b:1",
			title: bookTitle,
			author: {
				id: "a:1",
				firstName,
				lastName,
			},
		};
		return { data: { book: bookAuthorMock } };
	}

	const book: Omit<Book, "author"> = {
		id: "b:1",
		title: bookTitle,
	};
	return { data: { book } };
}

function updateBookMockResponse(
	bookAuthor: number | undefined,
	bookOnly: number | undefined
) {
	if (bookAuthor && bookOnly) {
		throw new Error("bookAuthor and bookOnly cannot both have non-zero values");
	}
	const [bookTitle] = bookNames[0];
	if (bookAuthor) {
		const bookAuthorMock: Omit<Book, "author"> & {
			author: { id: string; books: { id: string }[] };
		} = {
			id: "b:1",
			title: "A Book",
			author: {
				id: "a:1",
				books: [{ id: "b:1" }],
			},
		};
		return { data: { updateBook: bookAuthorMock } };
	}
	const book: Omit<Book, "author"> = {
		id: "b:1",
		title: bookTitle,
	};
	return { data: { updateBook: book } };
}

function deleteBookMockResponse(
	bookAuthor: number | undefined,
	bookOnly: number | undefined
) {
	if (bookAuthor && bookOnly) {
		throw new Error("bookAuthor and bookOnly cannot both have non-zero values");
	}
	return { data: { deleteBook: { id: "b:1" } } };
}

function removeBookAuthorMockResponse(
	bookAuthor: number | undefined,
	bookOnly: number | undefined
) {
	return { data: { removeBookAuthor: { id: "b:1", author: null } } };
}
