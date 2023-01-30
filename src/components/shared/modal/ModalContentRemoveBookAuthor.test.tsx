import { InMemoryCache } from "@apollo/client";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { REMOVE_BOOK_AUTHOR } from "src/graphql/mutations/book/removeBookAuthor";
import { ModalContentRemoveBookAuthor } from "./ModalContentRemoveBookAuthor";

describe("ModalContentRemoveBookAuthor", () => {
	it("removeBookAuthor updates cache to remove book from author", async () => {
		const user = userEvent.setup();

		// Given cache has an author that has a book
		const initialCacheState = {
			ROOT_QUERY: {
				__typename: "Query",
				'authors({"filter":{}})': [
					{
						__ref: "Author:a:1",
					},
				],
			},
			"Author:a:1": {
				__typename: "Author",
				id: "a:1",
				firstName: "Stephen",
				lastName: "King",
				fullName: "Stephen King",
				books: [
					{
						__ref: "Book:b:1",
					},
				],
			},
			"Book:b:1": {
				__typename: "Book",
				id: "b:1",
				title: "The Shining",
				author: {
					__ref: "Author:a:1",
				},
			},
		};

		// When component is rendered
		const cache = new InMemoryCache().restore(initialCacheState);
		render(
			<MockedProvider
				cache={cache}
				mocks={[removeBookAuthorMutationMock]}
				addTypename={true}
			>
				<ModalContentRemoveBookAuthor bookId="b:1" />
			</MockedProvider>
		);

		/**
     * Note: a way to check the cache as used in actual component
      const cachedData = cache.readQuery({
			  query: AUTHORS,
			  variables: { filter: {} },
		  });
     */

		// Then author has a book
		const initialCache = cache.extract();
		expect((initialCache["Author:a:1"]!.books! as []).length).toEqual(1);

		// When remove author button pressed
		await user.click(screen.getByText("Remove Author"));

		// Then cached is updated and author no longer has a book
		const updatedCache = cache.extract();
		expect((updatedCache["Author:a:1"]!.books! as []).length).toEqual(0);
	});
});

/**
 * An example of books query
 * const initialCacheState = {
			ROOT_QUERY: {
				__typename: "Query",
				books: [
					{
						// type: "id",
						// id: "b:1",
						__ref: "Book:b:1",
						// generated: false,
					},
				],
			},
			"Book:b:1": {
				__typename: "Book",
				id: "b:1",
				title: "Alex Cross",
				author: null,
			},
		};
		const cache = new InMemoryCache().restore(initialCacheState);
		const cachedData = cache.readQuery({
			query: BOOKS,
		});
 */

const removeBookAuthorMutationMock: Readonly<MockedResponse> = {
	request: {
		query: REMOVE_BOOK_AUTHOR,
		variables: { input: { id: "b:1" } },
	},
	result: {
		data: {
			removeBookAuthor: {
				id: "b:1",
				__typename: "Book",
				author: {
					id: "a:1",
					__typename: "Author",
				},
			},
		},
	},
};
