/* eslint-disable */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as ApolloReactHooks from 'src/hooks/apolloWrappers';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Author = {
  __typename?: 'Author';
  fullName: Scalars['String'];
  id: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  books?: Maybe<Array<Book>>;
};

export type Query = {
  __typename?: 'Query';
  authors: Array<Author>;
  author: Author;
  books: Array<Book>;
  book: Book;
  test?: Maybe<Scalars['String']>;
};


export type QueryAuthorsArgs = {
  filter: AuthorFilter;
  sortBy?: InputMaybe<AuthorSortType>;
};


export type QueryAuthorArgs = {
  id: Scalars['ID'];
};


export type QueryBookArgs = {
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addAuthor: Author;
  updateAuthor: Author;
  deleteAuthor: AuthorDeleteResult;
  deleteAuthorBooks: Author;
  addBook: Book;
  updateBook: Book;
  deleteBook: BookDeleteResult;
  removeBookAuthor: Book;
};


export type MutationAddAuthorArgs = {
  input: AuthorInput;
};


export type MutationUpdateAuthorArgs = {
  input: AuthorInput;
};


export type MutationDeleteAuthorArgs = {
  input: AuthorDeleteInput;
};


export type MutationDeleteAuthorBooksArgs = {
  input: AuthorBookInput;
};


export type MutationAddBookArgs = {
  input: BookInput;
};


export type MutationUpdateBookArgs = {
  input: BookInput;
};


export type MutationDeleteBookArgs = {
  input: BookDeleteInput;
};


export type MutationRemoveBookAuthorArgs = {
  input: BookAuthorInput;
};

export type AuthorDeleteResult = {
  __typename?: 'AuthorDeleteResult';
  id: Scalars['ID'];
};

export type AuthorInput = {
  id?: InputMaybe<Scalars['ID']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  bookIds?: InputMaybe<Array<Scalars['ID']>>;
};

export type AuthorBookInput = {
  id: Scalars['ID'];
  bookIds: Array<Scalars['ID']>;
};

export type AuthorFilter = {
  id?: InputMaybe<Array<Scalars['ID']>>;
  firstName?: InputMaybe<Array<Scalars['String']>>;
  lastName?: InputMaybe<Array<Scalars['String']>>;
  bookIds?: InputMaybe<Array<Scalars['ID']>>;
};

export type AuthorDeleteInput = {
  id: Scalars['ID'];
};

export type Book = {
  __typename?: 'Book';
  id: Scalars['ID'];
  title: Scalars['String'];
  author?: Maybe<Author>;
};

export type BookDeleteResult = {
  __typename?: 'BookDeleteResult';
  id: Scalars['ID'];
};

export type BookInput = {
  id?: InputMaybe<Scalars['ID']>;
  title?: InputMaybe<Scalars['String']>;
  authorId?: InputMaybe<Scalars['ID']>;
};

export type BookDeleteInput = {
  id: Scalars['ID'];
};

export type BookAuthorInput = {
  id: Scalars['ID'];
};

export enum AuthorSortType {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type AuthorQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type AuthorQuery = { __typename?: 'Query', author: { __typename?: 'Author', id: string, firstName: string, lastName: string, fullName: string, books?: Array<{ __typename?: 'Book', id: string, title: string, author?: { __typename?: 'Author', id: string } | null }> | null } };

export type UpdateAuthorMutationVariables = Exact<{
  input: AuthorInput;
}>;


export type UpdateAuthorMutation = { __typename?: 'Mutation', updateAuthor: { __typename?: 'Author', id: string, firstName: string, lastName: string, fullName: string, books?: Array<{ __typename?: 'Book', id: string, title: string, author?: { __typename?: 'Author', id: string, firstName: string, lastName: string } | null }> | null } };

export type AuthorsQueryVariables = Exact<{
  filter: AuthorFilter;
  sortBy?: InputMaybe<AuthorSortType>;
}>;


export type AuthorsQuery = { __typename?: 'Query', authors: Array<{ __typename?: 'Author', id: string, firstName: string, lastName: string, fullName: string, books?: Array<{ __typename?: 'Book', id: string, title: string, author?: { __typename?: 'Author', id: string } | null }> | null }> };


export const AuthorDocument = gql`
    query Author($id: ID!) {
  author(id: $id) {
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

/**
 * __useAuthorQuery__
 *
 * To run a query within a React component, call `useAuthorQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthorQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAuthorQuery(baseOptions: ApolloReactHooks.QueryHookOptions<AuthorQuery, AuthorQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AuthorQuery, AuthorQueryVariables>(AuthorDocument, options);
      }
export function useAuthorLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AuthorQuery, AuthorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AuthorQuery, AuthorQueryVariables>(AuthorDocument, options);
        }
export type AuthorQueryHookResult = ReturnType<typeof useAuthorQuery>;
export type AuthorLazyQueryHookResult = ReturnType<typeof useAuthorLazyQuery>;
export type AuthorQueryResult = Apollo.QueryResult<AuthorQuery, AuthorQueryVariables>;
export const UpdateAuthorDocument = gql`
    mutation updateAuthor($input: AuthorInput!) {
  updateAuthor(input: $input) {
    id
    firstName
    lastName
    fullName @client
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
export type UpdateAuthorMutationFn = Apollo.MutationFunction<UpdateAuthorMutation, UpdateAuthorMutationVariables>;

/**
 * __useUpdateAuthorMutation__
 *
 * To run a mutation, you first call `useUpdateAuthorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAuthorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAuthorMutation, { data, loading, error }] = useUpdateAuthorMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAuthorMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateAuthorMutation, UpdateAuthorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateAuthorMutation, UpdateAuthorMutationVariables>(UpdateAuthorDocument, options);
      }
export type UpdateAuthorMutationHookResult = ReturnType<typeof useUpdateAuthorMutation>;
export type UpdateAuthorMutationResult = Apollo.MutationResult<UpdateAuthorMutation>;
export type UpdateAuthorMutationOptions = Apollo.BaseMutationOptions<UpdateAuthorMutation, UpdateAuthorMutationVariables>;
export const AuthorsDocument = gql`
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

/**
 * __useAuthorsQuery__
 *
 * To run a query within a React component, call `useAuthorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthorsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      sortBy: // value for 'sortBy'
 *   },
 * });
 */
export function useAuthorsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<AuthorsQuery, AuthorsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AuthorsQuery, AuthorsQueryVariables>(AuthorsDocument, options);
      }
export function useAuthorsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AuthorsQuery, AuthorsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AuthorsQuery, AuthorsQueryVariables>(AuthorsDocument, options);
        }
export type AuthorsQueryHookResult = ReturnType<typeof useAuthorsQuery>;
export type AuthorsLazyQueryHookResult = ReturnType<typeof useAuthorsLazyQuery>;
export type AuthorsQueryResult = Apollo.QueryResult<AuthorsQuery, AuthorsQueryVariables>;