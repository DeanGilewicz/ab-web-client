import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import {
	renderWithApolloAndRouter,
	renderWithApolloAndRouterAndRoutes,
} from "src/testUtils";
import { HomePage } from "./HomePage";
import { NotFoundPage } from "./NotFoundPage";

describe("NotFoundPage", () => {
	it("can navigate to home page", async () => {
		const user = userEvent.setup();

		// Given we are on the not found page
		renderWithApolloAndRouterAndRoutes({
			components: [<NotFoundPage />, <HomePage />],
			initialRoute: "/lost",
			mocks: [],
			paths: ["/lost", "/"],
		});

		// Then the not found message is displayed
		expect(
			screen.getByText("Looks Like You Might Be Lost?")
		).toBeInTheDocument();

		// When go home button is pressed
		await user.click(screen.getByText("Go Home"));

		// Then we are navigated to the home page
		expect(screen.getByText("Welcome to Author Books")).toBeInTheDocument();
	});

	it("can render error", () => {
		// Given we are on the not found page	and there is an error
		renderWithApolloAndRouter({
			component: (
				<NotFoundPage
					error={{ message: "something went wrong", name: "error" }}
				/>
			),
			mocks: [],
			route: "/lost",
			path: "/lost",
		});

		// Then the error displayed
		expect(screen.getByText("something went wrong")).toBeInTheDocument();
	});
});
