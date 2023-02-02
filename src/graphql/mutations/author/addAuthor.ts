import { gql } from "@apollo/client";

export const ADD_AUTHOR = gql`
	mutation addAuthor($input: AuthorInput!) {
		addAuthor(input: $input) {
			id
			firstName
			lastName
		}
	}
`;
