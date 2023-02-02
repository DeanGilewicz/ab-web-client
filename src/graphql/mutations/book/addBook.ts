import { gql } from "@apollo/client";

export const ADD_BOOK = gql`
	mutation addBook($input: BookInput!) {
		addBook(input: $input) {
			id
			title
		}
	}
`;
