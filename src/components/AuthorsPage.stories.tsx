import { MockedResponse } from "@apollo/client/testing";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AUTHORS } from "src/graphql/queries/author/authors";
import { AuthorsPage } from "./AuthorsPage";

export default {
	title: "Page/Authors",
	component: AuthorsPage,
	parameters: {
		apolloClient: {
			mocks: [authorsQueryMock()],
		},
	},
} as ComponentMeta<typeof AuthorsPage>;

const Template: ComponentStory<typeof AuthorsPage> = () => {
	return (
		<MemoryRouter initialEntries={["/authors"]}>
			<Routes>
				<Route path={"/authors"} element={<AuthorsPage />} />
			</Routes>
		</MemoryRouter>
	);
};

export const Default = Template.bind({});

function authorsQueryMock(): Readonly<MockedResponse> {
	return {
		request: {
			query: AUTHORS,
			variables: { filter: {} },
		},
		result: {
			data: {
				authors: [
					{
						id: "a:1",
						firstName: "Demo",
						lastName: "User",
						fullName: "Demo User",
						books: [
							{
								id: "b:1",
								title: "A Book",
								author: { id: "a:1" },
							},
						],
					},
				],
			},
		},
	};
}
