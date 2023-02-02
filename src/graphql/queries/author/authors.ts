import { gql } from "@apollo/client";

export const AUTHORS = gql`
	query Authors($filter: AuthorFilter!, $sortBy: AuthorSortType) {
		authors(filter: $filter, sortBy: $sortBy) {
			id
			firstName
			lastName
			fullName @client
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
