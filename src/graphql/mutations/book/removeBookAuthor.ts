import { gql } from "@apollo/client";

export const REMOVE_BOOK_AUTHOR = gql`
	mutation deleteBook($input: BookAuthorInput!) {
		removeBookAuthor(input: $input) {
			id
			author {
				id
			}
		}
	}
`;
