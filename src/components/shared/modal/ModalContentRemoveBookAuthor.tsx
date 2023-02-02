import { useMutation } from "@apollo/client";

import "src/components/shared/modal/ModalContentRemoveBookAuthorStyles.css";

import { REMOVE_BOOK_AUTHOR } from "src/graphql/mutations/book/removeBookAuthor";
import { AUTHORS } from "src/graphql/queries/author/authors";
import {
	Author,
	Mutation,
	MutationRemoveBookAuthorArgs,
	QueryAuthorsArgs,
} from "src/generated/graphql-types";

import { ModalConfirmButton } from "src/components/shared/modal/Modal";

export function ModalContentRemoveBookAuthor({ bookId }: { bookId: string }) {
	const [removeBookAuthor] = useMutation<
		Mutation["removeBookAuthor"],
		MutationRemoveBookAuthorArgs
	>(REMOVE_BOOK_AUTHOR);

	const onRemoveBookAuthor = async () => {
		await removeBookAuthor({
			variables: { input: { id: bookId } },
			// mutation response currently only returns book id and author (which will be null)
			// to update cache we could refetch AUTHORS query but instead we'll avoid the additional
			// network request and handle the cache update ourselves
			update: (cache, _) => {
				// get all authors from cache
				const query = cache.readQuery<{ authors: Author[] }, QueryAuthorsArgs>({
					query: AUTHORS,
					variables: { filter: {} },
				});
				// find author that has associated book
				const author = query?.authors.find((a) =>
					a.books?.find((b) => b.id === bookId)
				);

				if (!author) return;

				// update cache to remove book from author
				cache.modify({
					id: cache.identify(author),
					fields: {
						books(existingBooks = []) {
							return existingBooks.filter((b: any) => {
								// turn "b:1" into "Book:b:1" to match ref used in cache
								const bookToRemoveCacheRef = cache.identify({
									__typename: "Book",
									id: bookId,
								});
								// access cache ref, i.e "Book:b:1", "Book:b:2" etc
								const existingBookCacheRef = cache.identify(b);
								// remove book
								return existingBookCacheRef !== bookToRemoveCacheRef;
							});
						},
					},
				});
			},
		});

		// close modal
		return true;
	};

	// content for confirmation modal (no open modal)
	return (
		<div className="modal-remove-book-author-content">
			<p>
				You are about to remove this author from this book. This action is not
				reversible!
			</p>
			<div className="action-container">
				<ModalConfirmButton>
					<button className="error" onClick={onRemoveBookAuthor}>
						Remove Author
					</button>
				</ModalConfirmButton>
			</div>
		</div>
	);
}
