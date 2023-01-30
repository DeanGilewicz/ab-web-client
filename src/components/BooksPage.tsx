import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";

import "src/components/BooksPageStyles.css";

import { BOOKS } from "src/graphql/queries/book/books";
import { Query } from "src/generated/graphql-types";

import { ModalConfirmation } from "src/components/shared/modal/ModalConfirmation";
import { ModalContentDeleteBook } from "src/components/shared/modal/ModalContentDeleteBook";
import { ModalCreateBook } from "src/components/shared/modal/ModalCreateBook";
import { ErrorMessage } from "src/components/shared/ErrorMessage";

export function BooksPage() {
	const { data, loading, error } = useQuery<Query>(BOOKS);

	return (
		<>
			<div className="books-page">
				<h2>Books</h2>

				{error && <ErrorMessage error={error} />}

				{loading && <p>...loading</p>}

				{!loading && (
					<div>
						<div className="books-page-actions">
							<ModalCreateBook />
						</div>
						<div className="books-page-cards">
							{data &&
								data.books.map((b) => (
									<article data-testid="books-page-book" key={b.id}>
										<p>
											<Link to={b.id}>{b.title}</Link>
											<ModalConfirmation
												content={<ModalContentDeleteBook bookId={b.id} />}
												title={`Delete ${b.title}`}
												triggerText="Delete"
											/>
										</p>
									</article>
								))}
						</div>
					</div>
				)}
			</div>
		</>
	);
}
