import { screen } from "@testing-library/react";
import App from "./App";
import { renderWithRouter } from "./testUtils";

describe("App", () => {
	it("renders navigation", () => {
		renderWithRouter({ component: <App /> });

		const homeLink = screen.getByTestId("nav-home");
		expect(homeLink.getAttribute("href")).toEqual("/");

		const authorsLink = screen.getByTestId("nav-authors");
		expect(authorsLink.getAttribute("href")).toEqual("/authors");

		const booksLink = screen.getByTestId("nav-books");
		expect(booksLink.getAttribute("href")).toEqual("/books");
	});

	it("renders home page content by default", () => {
		renderWithRouter({ component: <App /> });
		expect(screen.getByRole("main")).toHaveTextContent(
			"Welcome to Author Books"
		);
	});

	it("renders footer", () => {
		renderWithRouter({ component: <App /> });
		// contentinfo role defines a footer
		expect(screen.getByRole("contentinfo")).toHaveTextContent(
			"Author Books 2023"
		);
	});
});
