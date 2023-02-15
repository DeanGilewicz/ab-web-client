<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h2 align="center">✍📚 Authors Books - Web Client</h2>
  <p align="center">
    A React and Apollo Client Application!
  </p>
</div>

<br />
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
      <ul>
        <li><a href="#fonts">Fonts</a></li>
      </ul>
      <ul>
        <li><a href="#error-handling">Error Handling</a></li>
      </ul>
       <ul>
        <li><a href="#schema-and-types">Schema and Types</a></li>
      </ul>
       <ul>
        <li><a href="#application-logic">Application Logic</a></li>
      </ul>
       <ul>
        <li><a href="#apollo-client">Apollo Client</a></li>
      </ul>
      <ul>
        <li><a href="#testing">Testing</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#cicd">CI/CD</a></li>
    <li><a href="#deployment">Deployment</a></li>
  </ol>
</details>

<br />

## About The Project

This example project provides a UI to interact with the Author Books GraphQL Server.

It allows a user to create an `author` or `book` and assign an `author` to a `book` or any number of `books` to an `author`. Users can also remove an `author` from a `book` or remove a `book` from an `author`. An `author` or `book` can be `updated` or `deleted` and a list of `book`s or `author`s can be viewed.

There were several reasons for working on this project, including the chance to:

- build out a React application
- use Apollo Client for state management
- explore error handling strategies
- implement a comprehensive testing suite

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### **Built With**

Below is a list of major frameworks/libraries that were used to bootstrap this project.

- [![React][react]][react-url]
- [![Apollo][apollo]][apollo-url]
- [![GraphQL][graphql]][graphql-url]
- [![TypeScript][typescript]][typescript-url]
- [![Jest][jest]][jest-url]
- [![Storybook][storybook]][storybook-url]
- [![Playwright][playwright]][playwright-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### **Fonts**

[Google fonts](https://developers.google.com/fonts) were downloaded and stored within the application and served up to the user.

Once downloaded a free online font converter was used to convert `.ttf` into `.woff` and `.woff2` font formats.

These files were then copied to `src/fonts/` where webpack can dynamically bundle them.

In `indexStyles.css`, [@font-face](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) was used to map these custom fonts and applied to the `body` tag via `font-family`. Finally, these fonts were imported into `index.tsx`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### **Error Handling**

There are several approaches that can be considered when determining how to handle errors that occur within the application:

- handle errors directly in each component via `error` object returned by query or mutation

```ts
const [something, { loading, error, data }] = useQuery(SOMETHING);
```

- create an `ErrorMessage` component to abstract away the different errors but still handle directly in each component by passing `error` object as a `prop`

```ts
if (error.networkError) {
	// handle
}
if (error.graphQLErrors.length > 0) {
	// handle
}
if (error.clientErrors.length > 0) {
	// handle
}
```

```tsx
<ErrorMessage error={error}
```

- create [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)

```tsx
class ErrorBoundary extends React.Component {
	/* ... */
}
<ErrorBoundary>{/* App Component / Components */}</ErrorBoundary>;
```

- create a custom error context (plus `provider` and `hook`) to control global errors across the application, such as `ErrorContext.tsx`

```tsx
<ErrorContextProvider>{/* App Component / Components */}</ErrorContextProvider>;

function AppComponent() {
	const { errorMessage, setErrorMessage } = useErrorContext();
}
```

- create custom hook wrappers around default Apollo queries and mutations that handle errors - `apolloWrappers.ts`. Then update `graphql-codegen.yml` to include the `apolloReactHooksImportFrom` field that points to `apolloWrappers.ts`. Add an `<entityName.graphql` file that includes a query, and / or mutation. When the codegen is ran, it will produce implementations of these queries, lazy queries and mutations that include the custom error handling. These can then be referenced in the application.

```graphql
query Something() {
	something() {
		id
	}
}
```

```ts
const useQuery = function (query, options) {
	function showError() {
		// update state to render error component
		// log error message
	}
	const onError = useCallback((error) => showError(error), [showError]);
	return apolloUseQuery(query, { onError, ...options });
};
```

```tsx
// instead of Apollo default
const query = useQuery(SOMETHING);

// can use custom implementation
const query = useSomethingsQuery();
```

- use [React Error Boundary](https://www.npmjs.com/package/react-error-boundary) library

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### **Schema and Types**

To set up generating schema based on an external source, the `package.json` was updated to include a `graphql-download-local` script to use [Apollo Rover](https://www.apollographql.com/docs/rover/) that introspects the external schema and outputs results to `schema.graphql`.

A `graphql-codegen.yml` file was then added and the `package.json` updated to include a `graphql-codegen` script that looks at the `schema.graphql` file and outputs a `generated/graphql-types.tsx` file

Once the schema is created and codegen ran, these types can be referenced throughout the application.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### **Application Logic**

- Create Author:
  - When modal is open and invalid input is provided then validation errors will be displayed when pressing the "create" button
  - Valid input will result in a form submit when pressing the "create" button or pressing the enter key
- Create Books:
  - When modal is open and invalid input is provided then "create" button is disabled
  - Valid input will result in a form submit when pressing the "create" button or pressing the enter key
- Author Search Books:
  - this uses a lazy query to query books when the "search Books" button is pressed
  - data from lazy query is filtered for books that are not associated to an author
  - when a book is selected and author is updated, AuthorPage is re-rendered causing lazy query data to be updated thus displaying the correct filtered books in the dropdown
- Remove Author From Book:
  - since the `REMOVE_BOOK_AUTHOR` FE query looks like this:
  ```graphql
    removeBookAuthor(input: $input) {
     id
     author { id }
    }
  ```
  - the response from the mutation does not provide a way to update the associated author's books to remove this book from the associated author
  - therefore, an `update` function is used to handle this cache update manually, instead of refetching `AUTHORS` query

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### **Apollo Client**

[Apollo Client](https://www.apollographql.com/docs/react/) is a state management library that simplifies managing remote and local data with GraphQL. It allows you to fetch, cache, and modify application data, all while automatically updating UI.

This application has implemented several strategies to manage data as a way to provide some examples of approaches that you can take when building your application.

- For queries:
  - working directly with `loading`, `error` and `data` states
  - using `lazyQuery` to only fetch data when needed
  - `fetchPolicy` to set initial and subsequent data fetching strategy
  - `onCompleted` to set state when query successfully completes
  - `@client` directive for author's `fullName` field
- For mutations:
  - `refetchQueries` to refetch data from server to keep cache in sync
  - `update` to manually handle cache update from mutation
- For Type Polices:
  - `Author` books field custom logic added

There are several things that this app has not included an implementation, including but not limited to:

- queries:
  - `pollInterval`
  - `errorPolicy`
  - `initialFetchPolicy`
  - `nextFetchPolicy`
  - `refetch`
  - `skip`
- mutations:
  - default `variables` that are used when a mutation is called without these variables
  - `optimisticResponse` to update UI ahead of updates being made to server and receiving a successful response
  - `onQueryUpdated` to see what cached fields were updated during an update and maybe fetch data

Apollo client provides plenty of features, 2 of which have been outlined below:

- `TypePolicy`
  - a `typePolicy` was added for `author.books` to ensure we return incoming results from the query
  - this fixes the "removing book from author" warnings in the `console`
  - this fixes the "adding a book to author" so the UI reflects the newly added book
- `@client Directive`
  - The `@client` directive can be used to inform Apollo Client not to include a `<field>` in the query it sends to the server
  - In our application, the `fullName @client` field exists that will not send `fullName` to the server to resolve but instead be resolved either from, a) a local resolver function, or b) the Apollo Client cache
  - In this application, a `fullName @client` has been added to both `Authors` and `Author` queries (`authors.graphql` and `author.graphql`)
  - In order to handle the `fullName` field via the application's codegen process, a `schema-local.graphql` file was created to include code that extends `Author` to include the `fullName` field
  - The `graphql-codegen.yml` file was also updated to include the new `schema-local.graphql` file after `schema.graphql` in the `schema` field
  - The `schema.graphql` is generated from downloading the schema from an external source while the `schema-local.graphql` is locally and manually updated
  - The order for these file inclusions is important since `schema-local.graphql` is extending `Author` from `schema.graphql` so `schema.graphql` needs to exist first
  - Once the `schema.graphql` is downloaded and codegen ran, TypeScript will now recognize `Author.firstName`
  - A local resolver was then added to `index.tsx` to return a value for `Author.fullName`, which can then be used inside of components, for example in `AuthorsPage.tsx`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### **Testing**

This application includes, unit, visual regression and end-to-end testing.

- Unit
  - Jest is used since this comes out of the box with "Create React App"
  - Apollo Client Mock Provider is also used since that is the recommended way to work with Apollo Client when testing
    - make sure you are handling query and mutation `errors` since when testing with `MockProvider` errors can be swallowed and therefore, tests pass but query / mutations may not actually be invoked as you would expect
  - in `testUtils` a helper method has been implemented to allow a query and / or mutation to be resolved before asserting against the DOM
    - see `renderWithApolloAndRouter` for implementation of helper method that sets up the test structure to be the same as the application structure, including, providers, routes etc
- Storybook
  - has been implemented for different types of components in 2 ways:
    - visual UI where a snapshot of the component is created for each state it can be in
    - using the `play` functionality to perform user actions and assert against expected behavior
  - one thing to note is that the `controls` do not reset automatically when you change from one story back to another. A reset button in the table does contain a reset button the top right that will reset to default values when pressed
  - in order to test coverage, you need to have `storybook` running in one terminal window and then run the coverage command in another terminal window
- Playwright
  - allows use to perform testing across the application in a way that the user would perform actions
  - does not come with an in-built "watch" mode but ths app installed a open source watch library whic allows for debugging
    - allows the use of `debug` and `await page.pause()` to step through and pause code
  - when performing these tests the app uses a mock pattern to intercept the request and return a mocked response. It is possible for these tests to not use mocks but would need the FE to be connected to a running BE server
  - to aid in the handling of mock GraphQL requests, a custom method has been created that looks at the requests' `operationName` and `variables` and provide dedicated responses
  - in order to handle a current issue with ES Lint and Storybook, an update to `package.json` was made in the `eslintConfig` overrides section to disable an eslint rule for Playwright to avoid the warning "Avoid destructuring queries from `render` result, use `screen.<nameOfMethod>` instead"

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<br />

## Getting Started

The following information will provide you with the details necessary to get the application up and running locally.

### **Prerequisites**

On your operating system of choice, ensure that [NodeJS](https://nodejs.org/en/) version `18.12.0` is installed. It is recommended that a Node Version Manager be used, such as [NVM](https://github.com/nvm-sh/nvm). When installing `NodeJS` this way, the correctly associated `npm` version should automatically be installed.

```sh
nvm install node@18.12.0
```

### **Installation**

Once `NodeJS` and `npm` is installed you can follow these steps:

1. Clone the repo
   ```sh
   git clone https://github.com/DeanGilewicz/ab-web-client.git
   ```
2. Install NPM packages
   ```sh
   npm i
   ```
3. Download schema
   ```sh
   npm run graphql-download
   ```
4. Run codegen
   ```sh
   npm run graphql-codegen
   ```
5. Run the application
   ```sh
   npm start
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

The application provides a variety of commands in `package.json`:

- start
  - runs the application locally
- build
  - builds an optimized production application
- test
  - runs Jest unit tests
- test:coverage"
  - collects coverage of unit tests
- graphql-download-local
  - downloads external schema from a locally running BE
- graphql-download"
  - downloads external schema from an external running BE
- graphql-codegen
  - runs graphql codegen based on `graphql-codegen.yml `
- storybook
  - runs storybook locally
- test-storybook:coverage
  - runs coverage on storybook tests
- build-storybook
  - builds a snapshot of each story to be hosted somewhere, such as Chromatic
- start:staging
  - starts the application using `nodemon`, compiles TypeScript and uses `/db/prod.ts` data
- test:e2e
  - runs all Playwright tests
- test:e2e:watch
  - runs Playwright tests in watch mode

<br />

When running `npm run start`, create-react-app runs app in `development` mode. In order to run app in `production` mode run `npm run build` then `npx serve -s build`.

To ensure this app is connected to the correct env API add a `.env.local` file for local / development mode and an `.env.production.local` for production mode. For each file include `REACT_APP_API_URL=<API-endpoint>` before serving app.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## CI/CD

This app uses [GitHub Actions](https://docs.github.com/en/actions) as the CI/CD solution. There is an action for PR review that runs `linting`, `type checking` and `tests` and there is an action to facilitate production deployment.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Deployment

This app is deployed to [Netlify](https://www.netlify.com). To set this up, a Github repository was created with existing committed code on `main` branch. After logging in to Netlify this repository was imported from Github. The Github account was authorized with Netlify to allow the repository to be selected and then then the app was deployed via deploy site button on Netlify dashboard.

Once deployed, the Netlify `site id` and `personal access token` values were copied into the Github repo in `secrets and variables` actions for both `environment secrets` and `repository secrets` as `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.

The `site id` was accessed by going to the site settings of this app that was deployed. The `personal access token` was accessed by going to `User settings > Applications > create a new personal access token`.

The `REACT_APP_API_URL` environment variable was created in Netlify for this deployed project under `site settings > environment variables` using the production value.

Since this app uses `comment-on-commit`, the repo's `GITHUB_TOKEN` permissions needs to be updated from default to `read and write permissions`. This was achieved by logging into Github and going to `ab-web-client > settings > actions > general` then updating the `workflow permissions option` to read and write and saving.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[react]: https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=61DAFB
[react-url]: https://reactjs.org/
[apollo]: https://img.shields.io/badge/Apollo-3F20BA?style=for-the-badge&logo=ApolloGraphQL-&logoColor=311C87
[apollo-url]: https://www.apollographql.com/docs/react/
[graphql]: https://img.shields.io/badge/GraphQL-1E252D?style=for-the-badge&logo=graphql&logoColor=E10098&
[graphql-url]: https://graphql.org/
[typescript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=ffffff
[typescript-url]: https://www.typescriptlang.org/
[jest]: https://img.shields.io/badge/Jest-15c213?style=for-the-badge&logo=jest&logoColor=C21325
[jest-url]: https://jestjs.io/
[storybook]: https://img.shields.io/badge/Storybook-171C23?style=for-the-badge&logo=storybook&logoColor=FF4785
[storybook-url]: https://storybook.js.org/
[playwright]: https://img.shields.io/badge/Playwright-FFFFFF?style=for-the-badge&logo=playwright&logoColor=2EAD33
[playwright-url]: https://playwright.dev/
