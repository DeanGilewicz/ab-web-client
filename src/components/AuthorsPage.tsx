import { ApolloError, useLazyQuery } from "@apollo/client";
import { ChangeEvent, useState } from "react";
import { Link } from "react-router-dom";

import "src/components/AuthorsPageStyles.css";

import { AUTHORS } from "src/graphql/queries/author/authors";
import { useAuthorsQuery } from "src/generated/graphql-types";
import {
	Author,
	AuthorFilter,
	AuthorSortType,
	Query,
	QueryAuthorsArgs,
} from "src/generated/graphql-types";

import { ModalConfirmation } from "src/components/shared/modal/ModalConfirmation";
import { ModalContentDeleteAuthor } from "src/components/shared/modal/ModalContentDeleteAuthor";
import { ModalCreateAuthor } from "src/components/shared/modal/ModalCreateAuthor";

import { ErrorMessage } from "src/components/shared/ErrorMessage";

export function AuthorsPage() {
	const [authors, setAuthors] = useState<Author[] | undefined>();

	/**
	 * Apollo useQuery example
	 */
	// const { loading, error, data } = useQuery<Query, QueryAuthorsArgs>(AUTHORS, {
	// 	variables: { filter: {} },
	// 	onCompleted(data) {
	// 		setAuthors(data.authors);
	// 	},
	// });

	/**
	 * Custom error wrapper useQuery example
	 */
	const { loading, data } = useAuthorsQuery({
		variables: { filter: {} },
		onCompleted(data) {
			setAuthors(data.authors as Author[]);
		},
	});

	/**
	 * useLazyQuery example
	 */
	const [filterAuthors] = useLazyQuery<Query, QueryAuthorsArgs>(AUTHORS);

	/**
	 * handle author filters and errors
	 */
	const [filter, setFilter] = useState<AuthorFilter>({});
	const [filterError, setFilterError] = useState<ApolloError | undefined>();

	const handleFilter = async (
		filterKey: keyof AuthorFilter,
		e: ChangeEvent<HTMLSelectElement>
	) => {
		e.preventDefault();
		const f = { ...filter };
		if (!e.target.value) {
			if (f[filterKey]) {
				delete f[filterKey];
			}
		} else {
			f[filterKey] = [e.target.value];
		}

		setFilter(f);
		const response = await filterAuthors({
			variables: { filter: f },
			onError: (error) => setFilterError(error),
		});
		setAuthors(response.data?.authors);
	};

	const handleSortById = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const sortBy =
			e.target.value === "ASC" ? AuthorSortType.Asc : AuthorSortType.Desc;
		const response = await filterAuthors({
			variables: { filter, sortBy },
			fetchPolicy: "network-only",
			onError: (error) => setFilterError(error),
		});
		setAuthors(response.data?.authors);
	};

	return (
		<>
			<div className="authors-page">
				<h2>Authors</h2>

				{loading && <p>...loading</p>}

				{!loading && (
					<>
						<div className="authors-page-actions">
							<div className="authors-page-filters">
								<select
									data-testid="authors-page-filter-first-name"
									onChange={(e) => handleFilter("firstName", e)}
								>
									<option value="">First Name</option>
									{data &&
										data?.authors.map((a) => (
											<option key={a.id} value={a.firstName}>
												{a.firstName}
											</option>
										))}
								</select>
								<select
									data-testid="authors-page-filter-last-name"
									onChange={(e) => handleFilter("lastName", e)}
								>
									<option value="">Last Name</option>
									{data &&
										data?.authors.map((a) => (
											<option key={a.id} value={a.lastName}>
												{a.lastName}
											</option>
										))}
								</select>
								<select
									data-testid="authors-page-filter-sort"
									onChange={handleSortById}
								>
									<option value={AuthorSortType.Asc}>Asc</option>
									<option value={AuthorSortType.Desc}>Desc</option>
								</select>
								<div>{filterError && <ErrorMessage error={filterError} />}</div>
							</div>
							<ModalCreateAuthor />
						</div>
						<div className="authors-page-cards">
							{authors &&
								authors?.map((a) => (
									<article data-testid="authors-page-author" key={a.id}>
										<div className="authors-page-cards-left">
											<Link to={a.id}>{a.fullName}</Link>
											<ModalConfirmation
												content={<ModalContentDeleteAuthor authorId={a.id} />}
												title={`Delete ${a.fullName}`}
												triggerText="Delete"
											/>
										</div>
										<div className="authors-page-cards-middle"></div>
										<div className="authors-page-cards-right">
											<ul>
												{a.books &&
													a.books.map((b) => (
														<li key={b.id}>
															<Link to={`/books/${b.id}`}>{b.title}</Link>
														</li>
													))}
											</ul>
										</div>
									</article>
								))}
						</div>
					</>
				)}
			</div>
		</>
	);
}
