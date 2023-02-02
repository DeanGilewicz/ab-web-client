import { gql } from "@apollo/client";

export const DELETE_AUTHOR_BOOKS = gql`
	mutation deleteAuthorBooks($input: AuthorBookInput!) {
		deleteAuthorBooks(input: $input) {
			id
			firstName
			lastName
			books {
				id
				title
				author {
					id
				}
			}
		}
	}
`;
