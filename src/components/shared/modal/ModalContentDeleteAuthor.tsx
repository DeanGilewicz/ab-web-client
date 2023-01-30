import { useMutation } from "@apollo/client";

import "src/components/shared/modal/ModalContentDeleteAuthorStyles.css";

import { DELETE_AUTHOR } from "src/graphql/mutations/author/deleteAuthor";
import { AUTHORS } from "src/graphql/queries/author/authors";
import {
	Mutation,
	MutationDeleteAuthorArgs,
} from "src/generated/graphql-types";

import { ModalConfirmButton } from "src/components/shared/modal/Modal";

export function ModalContentDeleteAuthor({ authorId }: { authorId: string }) {
	const [deleteAuthor] = useMutation<
		Mutation["deleteAuthor"],
		MutationDeleteAuthorArgs
	>(DELETE_AUTHOR);

	async function onDeleteAuthor() {
		await deleteAuthor({
			variables: { input: { id: authorId } },
			refetchQueries: [{ query: AUTHORS, variables: { filter: {} } }],
		});
		// close modal
		return true;
	}

	// content for confirmation modal (no open modal)
	return (
		<div className="modal-delete-author-content">
			<p>You are about to delete this author. This action is not reversible!</p>
			<div className="action-container">
				<ModalConfirmButton>
					<button className="error" onClick={onDeleteAuthor}>
						Delete Author
					</button>
				</ModalConfirmButton>
			</div>
		</div>
	);
}
