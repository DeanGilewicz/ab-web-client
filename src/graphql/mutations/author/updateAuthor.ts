import { gql } from "@apollo/client";

export const UPDATE_AUTHOR = gql`
	mutation updateAuthor($input: AuthorInput!) {
		updateAuthor(input: $input) {
			id
			firstName
			lastName
			books {
				id
				title
				author {
					id
					firstName
					lastName
				}
			}
		}
	}
`;
