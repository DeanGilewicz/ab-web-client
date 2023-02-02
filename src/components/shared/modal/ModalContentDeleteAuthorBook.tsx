import { useMutation } from "@apollo/client";

import "src/components/shared/modal/ModalContentDeleteAuthorBookStyles.css";

import { DELETE_AUTHOR_BOOKS } from "src/graphql/mutations/author/deleteAuthorBooks";
import { BOOKS } from "src/graphql/queries/book/books";
import {
	Mutation,
	MutationDeleteAuthorBooksArgs,
} from "src/generated/graphql-types";

import { ModalConfirmButton } from "src/components/shared/modal/Modal";

export function ModalContentDeleteAuthorBook({
	authorId,
	bookId,
}: {
	authorId: string;
	bookId: string;
}) {
	const [deleteAuthorBooks] = useMutation<
		Mutation["deleteAuthorBooks"],
		MutationDeleteAuthorBooksArgs
	>(DELETE_AUTHOR_BOOKS, {
		refetchQueries: [{ query: BOOKS }],
	});

	const onUnAssociateBook = async () => {
		await deleteAuthorBooks({
			variables: {
				input: { id: authorId, bookIds: [bookId] },
			},
		});
		// close modal
		return true;
	};

	// content for confirmation modal (no open modal)
	return (
		<div className="modal-delete-author-book-content">
			<p>
				You are about to remove this book from this author. This action is not
				reversible!
			</p>
			<div className="action-container">
				<ModalConfirmButton>
					<button
						className="error"
						onClick={async () => await onUnAssociateBook()}
					>
						Remove Book
					</button>
				</ModalConfirmButton>
			</div>
		</div>
	);
}
