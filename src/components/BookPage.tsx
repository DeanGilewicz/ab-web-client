import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import "src/components/BookPageStyles.css";

import { UPDATE_BOOK } from "src/graphql/mutations/book/updateBook";
import { AUTHORS } from "src/graphql/queries/author/authors";
import { BOOK } from "src/graphql/queries/book/book";
import {
	Mutation,
	MutationUpdateBookArgs,
	Query,
	QueryAuthorsArgs,
	QueryBookArgs,
} from "src/generated/graphql-types";
import { FormMode } from "src/enums";

import { useErrorContext } from "src/contexts/ErrorContext";

import { ModalConfirmation } from "src/components/shared/modal/ModalConfirmation";
import { ModalContentRemoveBookAuthor } from "src/components/shared/modal/ModalContentRemoveBookAuthor";

export function BookPage() {
	const { bookId } = useParams();

	const { loading, error, data } = useQuery<Query, QueryBookArgs>(BOOK, {
		variables: { id: bookId! },
	});

	const [updateBook] = useMutation<
		Mutation["updateBook"],
		MutationUpdateBookArgs
	>(UPDATE_BOOK);

	const [queryAuthors, { data: authorsData, error: authorsError }] =
		useLazyQuery<Query, QueryAuthorsArgs>(AUTHORS, {
			variables: { filter: {} },
		});

	const [title, setTitle] = useState<string | undefined>();
	const { errorMessage, setErrorMessage } = useErrorContext();
	const [searchParams, setSearchParams] = useSearchParams();

	/**
	 * Custom Error Context example
	 */
	useEffect(() => {
		if (error && error.graphQLErrors) {
			setErrorMessage(
				error.graphQLErrors.map((error) => ({
					locations: error.locations?.map((l) => l) || [
						{ column: 123456, line: 123456 },
					],
					message: error.message,
					path: error.path?.map((p) => `${p}`) || [""],
				}))
			);
		}
	}, [error, setErrorMessage]);

	useEffect(() => {
		if (error && error.networkError) {
			setErrorMessage([
				{
					locations: [
						{
							column: 123456,
							line: 123456,
						},
					],
					message: error.networkError.message,
					path: ["unknown"],
				},
			]);
		}
	}, [error, setErrorMessage]);

	useEffect(() => {
		if (authorsError) {
			setErrorMessage([
				{
					locations: [
						{
							column: 123456,
							line: 123456,
						},
					],
					message: authorsError.message,
					path: ["unknown"],
				},
			]);
		}
	}, [authorsError, setErrorMessage]);

	const book = data?.book;

	// set initial book title
	useEffect(() => {
		setTitle(book?.title);
	}, [book?.title]);

	const isEditMode = searchParams.get("state") === FormMode.EDIT;

	const handleEdit = () => {
		setSearchParams({ state: "edit" });
	};

	const handleCancel = () => {
		setSearchParams({});
		setTitle(book?.title || "");
	};

	const handleSave = async () => {
		const input = {
			id: book?.id,
			title,
		};
		await updateBook({ variables: { input } });
		setSearchParams({});
	};

	const onAddAuthor = async (
		e: ChangeEvent<HTMLSelectElement>,
		bookId: string
	) => {
		const authorId = e.target.value;
		if (!authorId || !bookId) return;
		await updateBook({
			variables: { input: { id: bookId, authorId } },
			onError: (error) =>
				error.networkError
					? setErrorMessage([
							{
								locations: [{ column: 123456, line: 123456 }],
								message: error.networkError.message,
								path: ["unknown"],
							},
					  ])
					: console.error("something when wrong!"),
		});
		return true;
	};

	return (
		<>
			{loading && <p>...loading</p>}
			{errorMessage}
			{!loading && book && (
				<article key={book.id}>
					{isEditMode ? (
						<div className="book-edit">
							<div className="book-edit-dismiss">
								<button onClick={handleCancel}>Close</button>
							</div>
							<div className="book-edit-header">
								<h3>Edit Book</h3>
							</div>
							<div className="book-edit-content-form">
								<div className="book-edit-input-container">
									<label htmlFor="book-title">Title</label>
									<input
										id="book-title"
										name="book-title"
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
									/>
								</div>
							</div>
							<div className="book-edit-action-container">
								<button
									className="success"
									disabled={!title}
									onClick={handleSave}
								>
									Save
								</button>
							</div>
						</div>
					) : (
						<div className="book-page-card">
							<article>
								<div className="book-page-card-left">
									<span>{title}</span>
									<button onClick={handleEdit}>Edit</button>
								</div>
								<div className="book-page-card-middle"></div>
								<div className="book-page-card-right">
									<ul>
										{book.author ? (
											<li key={book.author.id}>
												<div data-testid="book-page-author">
													<Link
														to={`/authors/${book.author?.id}`}
													>{`${book.author?.firstName} ${book.author?.lastName}`}</Link>
													<ModalConfirmation
														content={
															<ModalContentRemoveBookAuthor bookId={book.id} />
														}
														title={`Remove ${book.author.firstName} ${book.author.lastName}`}
														triggerText="x"
													/>
												</div>
											</li>
										) : (
											<div>
												{authorsData && authorsData.authors.length > 0 ? (
													<select
														data-testid="dropdown-assign-author"
														onChange={(e) => onAddAuthor(e, book.id)}
													>
														<option value="">-Assign Author-</option>
														{authorsData.authors.map((author) => {
															return (
																<option key={author.id} value={author.id}>
																	{author.firstName} {author.lastName}
																</option>
															);
														})}
													</select>
												) : !authorsData ? (
													<button onClick={async () => await queryAuthors()}>
														Search Authors
													</button>
												) : (
													"No authors available"
												)}
											</div>
										)}
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
