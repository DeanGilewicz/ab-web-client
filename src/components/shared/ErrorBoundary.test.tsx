import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

describe("ErrorBoundary", () => {
	it("renders children content by default", () => {
		// Given an error boundary with child content
		// When rendered
		render(
			<ErrorBoundary>
				<p>children content</p>
			</ErrorBoundary>
		);
		// Then child content is displayed
		expect(screen.getByText("children content")).toBeInTheDocument();
	});

	it("renders error", () => {
		// reduce noise in output
		jest.spyOn(console, "error").mockImplementation(() => {});
		// error component
		const ThrowError = () => {
			throw new Error("Test");
		};
		// Given an error boundary with a child component that throws an error
		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>
		);
		// Then error content is displayed
		expect(screen.getByText("Sorry.. there was an error")).toBeInTheDocument();
	});
});
