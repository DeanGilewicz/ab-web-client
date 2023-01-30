import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalConfirmation } from "./ModalConfirmation";

describe("ModalConfirmation", () => {
	it("renders default content", async () => {
		const user = userEvent.setup();
		// Given required props are passed
		// When the modal is rendered
		render(
			<ModalConfirmation
				content={<div>some test modal content</div>}
				triggerText="Open Modal"
			/>
		);
		// and open modal button pressed
		await user.click(screen.getByText("Open Modal"));

		// Then modal contents displays heading
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Default Title"
		);
		// and message
		expect(
			screen.getByText("Are you sure you want to perform this action?")
		).toBeInTheDocument();
	});

	it("can be closed", async () => {
		const user = userEvent.setup();
		// Given required props are passed
		// When the modal is rendered
		render(
			<ModalConfirmation
				content={<div>some test modal content</div>}
				triggerText="Open Modal"
			/>
		);
		// and open modal button pressed
		await user.click(screen.getByText("Open Modal"));

		// Then modal contents is displayed
		expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
			"Default Title"
		);

		// When modal closed button is pressed
		await user.click(screen.getByText("Close"));

		// Then modal contents is not displayed
		expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
	});
});
