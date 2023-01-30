import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalContents } from "./Modal";

describe("Modal", () => {
	it("renders default modal contents", async () => {
		// Given required props are passed
		// When modal contents is rendered
		render(
			<ModalContents
				children={<div>some test modal content</div>}
				// opens modal contents
				{...{ isOpen: true }}
			/>
		);

		// Then modal contents displays heading
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Default Title"
		);
		// and content
		expect(screen.getByText("some test modal content")).toBeInTheDocument();
	});

	it("does not close modal by default", async () => {
		const user = userEvent.setup();
		// Given required props are passed
		// When modal contents is rendered
		render(
			<ModalContents
				children={<div>some test modal content</div>}
				// opens modal contents
				{...{ isOpen: true }}
			/>
		);
		// and close button pressed
		await user.click(screen.getByText("Close"));

		// Then modal contents displays heading
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Default Title"
		);
		// and content
		expect(screen.getByText("some test modal content")).toBeInTheDocument();
	});

	it("calls dismissFn when attempting to close modal", async () => {
		const user = userEvent.setup();
		const dismissFn = jest.fn();
		// Given required props are passed
		// When modal contents is rendered
		render(
			<ModalContents
				children={<div>some test modal content</div>}
				dismissFn={dismissFn}
				// opens modal contents
				{...{ isOpen: true }}
			/>
		);
		// and close button pressed
		await user.click(screen.getByText("Close"));

		// Then dismiss fn is called
		expect(dismissFn).toHaveBeenCalledTimes(1);
	});
});
