import { gql } from "@apollo/client";

export const UPDATE_BOOK = gql`
	mutation updateBook($input: BookInput!) {
		updateBook(input: $input) {
			id
			title
			author {
				id
				books {
					id
				}
			}
		}
	}
`;
