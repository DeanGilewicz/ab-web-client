import { ChangeEvent, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import "src/components/AuthorPageStyles.css";

import { BOOKS } from "src/graphql/queries/book/books";
import { Query } from "src/generated/graphql-types";
import {
	useAuthorQuery,
	useUpdateAuthorMutation,
} from "src/generated/graphql-types";
import { FormMode } from "src/enums";

import { ModalConfirmation } from "src/components/shared/modal/ModalConfirmation";
import { ModalContentDeleteAuthorBook } from "src/components/shared/modal/ModalContentDeleteAuthorBook";
import { useLazyQuery } from "src/hooks/apolloWrappers";

export function AuthorPage() {
	const { authorId } = useParams();

	const [firstName, setFirstName] = useState<string | undefined>("");
	const [lastName, setLastName] = useState<string | undefined>("");

	/**
	 * Apollo useQuery example
	 */
	// const { loading, data } = useQuery<Query, QueryAuthorArgs>(AUTHOR, {
	// 	variables: { id: authorId! },
	// 	onCompleted(data) {
	// 		setFirstName(data.author.firstName);
	// 		setLastName(data.author.lastName);
	// 	},
	// });

	/**
	 * Custom error wrapper useQuery example
	 */
	const { loading, data } = useAuthorQuery({
		variables: { id: authorId! },
		onCompleted(data) {
			setFirstName(data.author.firstName);
			setLastName(data.author.lastName);
		},
	});

	const [queryBooks, { data: queries }] = useLazyQuery<Query>(BOOKS);

	/**
	 * Apollo useMutation example
	 */
	// const [updateAuthor] = useMutation<
	// 	Mutation["updateAuthor"],
	// 	MutationUpdateAuthorArgs
	// >(UPDATE_AUTHOR);

	/**
	 * Custom error wrapper useMutation example
	 */
	const [updateAuthor] = useUpdateAuthorMutation();

	const [errors, setErrors] = useState<string[]>([]);

	const author = data?.author;

	const [searchParams, setSearchParams] = useSearchParams();
	const isEditMode = searchParams.get("state") === FormMode.EDIT;

	const handleEdit = () => {
		setSearchParams({ state: "edit" });
	};

	const handleCancel = () => {
		setSearchParams({});
		setFirstName(author?.firstName);
		setLastName(author?.lastName);
		setErrors([]);
	};

	const handleSave = async () => {
		const input = {
			id: author?.id,
			firstName: firstName,
			lastName: lastName,
		};
		await updateAuthor({ variables: { input } });
		setSearchParams({});
	};

	const booksNoAuthor = useMemo(
		() => queries?.books.filter((book) => !book.author),
		[queries?.books]
	);

	const onAssociateBook = async (e: ChangeEvent<HTMLSelectElement>) => {
		const selectedBookId = e.target.value;
		if (!selectedBookId) return;
		await updateAuthor({
			variables: { input: { id: authorId, bookIds: [selectedBookId] } },
		});
	};

	const onEditAuthor = async () => {
		const errors = [];
		if (!firstName || firstName.split(" ").length > 1) {
			errors.push("Provided first name must not have spaces");
		}
		if (!lastName || lastName.split(" ").length > 1) {
			errors.push("Provided last name must not have spaces");
		}
		if (errors.length > 0) {
			setErrors(errors);
		} else {
			await handleSave();
			setErrors([]);
		}
	};

	return (
		<>
			{loading && <p>...loading</p>}
			{!loading && author && (
				<article key={author.id}>
					<div>
						{booksNoAuthor && booksNoAuthor.length > 0 ? (
							<select
								data-testid="dropdown-assign-book"
								onChange={onAssociateBook}
							>
								<option value="">-Assign Book-</option>
								{booksNoAuthor.map((book) => {
									return (
										<option key={book.id} value={book.id}>
											{book.title}
										</option>
									);
								})}
							</select>
						) : booksNoAuthor && booksNoAuthor.length === 0 ? (
							"No books available"
						) : (
							<button onClick={async () => await queryBooks()}>
								Search Books
							</button>
						)}
					</div>
					{isEditMode ? (
						<div className="author-edit">
							<div className="author-edit-dismiss">
								<button onClick={handleCancel}>Close</button>
							</div>
							<div className="author-edit-header">
								<h3>Edit Author</h3>
							</div>
							<div className="author-edit-content-form">
								<div className="author-edit-input-container-errors">
									{errors.length > 0 && (
										<ul>
											{errors.map((error: string) => {
												return <li key={error}>{error}</li>;
											})}
										</ul>
									)}
								</div>
								<div className="author-edit-input-container">
									<label htmlFor="first-name">First Name</label>
									<input
										id="first-name"
										name="first-name"
										type="text"
										value={firstName}
										onChange={(e) => setFirstName(e.target.value)}
									/>
								</div>
								<div className="author-edit-input-container">
									<label htmlFor="last-name">Last Name</label>
									<input
										id="last-name"
										name="last-name"
										type="text"
										value={lastName}
										onChange={(e) => setLastName(e.target.value)}
									/>
								</div>
							</div>
							<div className="author-edit-action-container">
								<button
									className="success"
									disabled={!firstName || !lastName}
									onClick={onEditAuthor}
								>
									Save
								</button>
							</div>
						</div>
					) : (
						<div className="author-page-card">
							<article>
								<div className="author-page-card-left">
									<span>
										{firstName} {lastName}
									</span>
									<button onClick={handleEdit}>Edit</button>
								</div>
								<div className="author-page-card-middle"></div>
								<div className="author-page-card-right">
									<ul data-testid="author-page-books">
										{author.books?.map((book) => (
											<li key={book.id}>
												<div>
													<Link to={`/books/${book.id}`}>{book.title}</Link>
													{book.author?.id && (
														<ModalConfirmation
															content={
																<ModalContentDeleteAuthorBook
																	authorId={book.author.id}
																	bookId={book.id}
																/>
															}
															title={`Remove ${book.title}`}
															triggerText="x"
														/>
													)}
												</div>
											</li>
										))}
									</ul>
								</div>
							</article>
						</div>
					)}
				</article>
			)}
		</>
	);
}
