import { gql } from "@apollo/client";

export const BOOK = gql`
	query Book($id: ID!) {
		book(id: $id) {
			id
			title
			author {
				id
				firstName
				lastName
			}
		}
	}
`;
