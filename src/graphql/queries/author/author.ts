import { gql } from "@apollo/client";

export const AUTHOR = gql`
	query Author($id: ID!) {
		author(id: $id) {
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
