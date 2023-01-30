import { useMutation } from "@apollo/client";
import { useState } from "react";

import "src/components/shared/modal/ModalCreateAuthorStyles.css";

import { ADD_AUTHOR } from "src/graphql/mutations/author/addAuthor";
import { AUTHORS } from "src/graphql/queries/author/authors";
import { Mutation, MutationAddAuthorArgs } from "src/generated/graphql-types";
import {
	Modal,
	ModalConfirmButton,
	ModalContents,
	ModalFormSubmit,
	ModalOpenButton,
} from "./Modal";

export function ModalCreateAuthor() {
	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");
	const [errors, setErrors] = useState<string[]>([]);

	const [addAuthor] = useMutation<Mutation["addAuthor"], MutationAddAuthorArgs>(
		ADD_AUTHOR,
		{
			// default policy
			// errorPolicy: "none",
			// graphQLErrors seems to always be an empty array
			// onError: (e) => console.log("empty array", e.graphQLErrors),
			// using any since issue with `result` not existing on networkError (Error)
			// onError: (e: any) => setErrorMessage(e.networkError?.result.errors),
		}
	);

	const onCreateAuthor = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const errors = [];
		if (!firstName || firstName.split(" ").length > 1) {
			errors.push("Provided first name must not have spaces");
		}
		if (!lastName || lastName.split(" ").length > 1) {
			errors.push("Provided last name must not have spaces");
		}
		if (errors.length > 0) {
			return setErrors(errors);
		}
		try {
			await addAuthor({
				variables: { input: { firstName, lastName } },
				refetchQueries: [{ query: AUTHORS, variables: { filter: {} } }],
			});
			resetForm();
			// close modal
			return true;
		} catch (err) {
			console.error("onCreateAuthor error", err);
		}
	};

	function resetForm() {
		setFirstName("");
		setLastName("");
		setErrors([]);
	}

	return (
		<Modal>
			<ModalOpenButton>
				<button>Create Author</button>
			</ModalOpenButton>
			<ModalContents dismissFn={resetForm} title="Create Author">
				<div className="modal-create-author-content">
					<ModalFormSubmit>
						<form
							className="modal-create-author-content-form"
							onSubmit={(e) => onCreateAuthor(e)}
						>
							<div className="input-container-errors">
								{errors.length > 0 && (
									<ul>
										{errors.map((error: string) => {
											return <li key={error}>{error}</li>;
										})}
									</ul>
								)}
							</div>
							<div className="input-container">
								<label htmlFor="first-name">First Name</label>
								<input
									id="first-name"
									name="first-name"
									onChange={(e) => setFirstName(e.target.value)}
									type="text"
									value={firstName}
								/>
							</div>
							<div className="input-container">
								<label htmlFor="last-name">Last Name</label>
								<input
									id="last-name"
									name="last-name"
									onChange={(e) => setLastName(e.target.value)}
									type="text"
									value={lastName}
								/>
							</div>
							<div className="action-container">
								<ModalConfirmButton>
									<button className="success" type="submit">
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
