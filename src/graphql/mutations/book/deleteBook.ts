import { gql } from "@apollo/client";

export const DELETE_BOOK = gql`
	mutation deleteBook($input: BookDeleteInput!) {
		deleteBook(input: $input) {
			id
		}
	}
`;
