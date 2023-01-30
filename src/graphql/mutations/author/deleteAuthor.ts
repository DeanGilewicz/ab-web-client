import { gql } from "@apollo/client";

export const DELETE_AUTHOR = gql`
	mutation deleteAuthor($input: AuthorDeleteInput!) {
		deleteAuthor(input: $input) {
			id
		}
	}
`;
