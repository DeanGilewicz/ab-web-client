import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

import "src/components/shared/modal/ModalContentDeleteBookStyles.css";

import { DELETE_BOOK } from "src/graphql/mutations/book/deleteBook";
import { BOOKS } from "src/graphql/queries/book/books";
import { Mutation, MutationDeleteBookArgs } from "src/generated/graphql-types";

import { ModalConfirmButton } from "src/components/shared/modal/Modal";

export function ModalContentDeleteBook({ bookId }: { bookId: string }) {
	const navigate = useNavigate();

	const [deleteBook] =
		useMutation<Mutation["deleteBook"], MutationDeleteBookArgs>(DELETE_BOOK);

	const onDeleteBook = async () => {
		await deleteBook({
			variables: { input: { id: bookId } },
			refetchQueries: [{ query: BOOKS }],
		});
		// close modal and redirect
		return navigate("/books", { replace: true });
	};

	// content for confirmation modal (no open modal)
	return (
		<div className="modal-delete-book-content">
			<p>You are about to delete this book. This action is not reversible!</p>
			<div className="action-container">
				<ModalConfirmButton>
					<button className="error" onClick={onDeleteBook}>
						Delete Book
					</button>
				</ModalConfirmButton>
			</div>
		</div>
	);
}
