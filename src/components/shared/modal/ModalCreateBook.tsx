import { useMutation } from "@apollo/client";
import { useState } from "react";

import "src/components/shared/modal/ModalCreateBookStyles.css";

import { ADD_BOOK } from "src/graphql/mutations/book/addBook";
import { BOOKS } from "src/graphql/queries/book/books";
import { Mutation, MutationAddBookArgs } from "src/generated/graphql-types";

import {
	Modal,
	ModalConfirmButton,
	ModalContents,
	ModalFormSubmit,
	ModalOpenButton,
} from "src/components/shared//modal/Modal";

export function ModalCreateBook() {
	const [bookTitle, setBookTitle] = useState<string>("");

	const [addBook] = useMutation<Mutation["addBook"], MutationAddBookArgs>(
		ADD_BOOK
	);

	const onCreateBook = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			await addBook({
				variables: { input: { title: bookTitle } },
				refetchQueries: [{ query: BOOKS }],
			});
			resetForm();
			// close modal
			return true;
		} catch (err) {
			console.error("onCreateBook error", err);
		}
	};

	function resetForm() {
		setBookTitle("");
	}

	return (
		<Modal isOpen={true}>
			<ModalOpenButton>
				<button>Create Book</button>
			</ModalOpenButton>
			<ModalContents dismissFn={resetForm} title="Create Book">
				<div className="modal-create-book-content">
					<ModalFormSubmit>
						<form
							className="modal-create-book-content-form"
							onSubmit={(e) => onCreateBook(e)}
						>
							<div className="input-container">
								<label htmlFor="book-title">Title</label>
								<input
									id="book-title"
									name="book-title"
									onChange={(e) => setBookTitle(e.target.value)}
									type="text"
									value={bookTitle}
								/>
							</div>
							<div className="action-container">
								<ModalConfirmButton>
									<button
										disabled={!bookTitle}
										className="success"
										// defer to form submit
										type="submit"
									>
										Create
									</button>
								</ModalConfirmButton>
							</div>
						</form>
					</ModalFormSubmit>
				</div>
			</ModalContents>
		</Modal>
	);
}
