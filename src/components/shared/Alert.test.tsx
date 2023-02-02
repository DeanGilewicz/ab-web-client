import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert, AlertLevel } from "./Alert";

describe("Alert", () => {
	it("does not render alert content by default", () => {
		// Given an alert component that is closed
		render(
			<Alert
				level={AlertLevel.Info}
				message="an alert message"
				onDismiss={() => {}}
				open={false}
			/>
		);
		// Then content is not displayed
		expect(screen.queryByText("an alert message")).not.toBeInTheDocument();
	});

	it("renders alert content when open", () => {
		// Given an alert component that is open
		render(
			<Alert
				level={AlertLevel.Info}
				message="an alert message"
				onDismiss={() => {}}
				open={true}
			/>
		);
		// Then content is displayed
		expect(screen.getByText("an alert message")).toBeInTheDocument();
	});

	it("call onDismiss when close button pressed", async () => {
		const user = userEvent.setup();
		const onDismiss = jest.fn();
		// Given an alert component that is open
		render(
			<Alert
				level={AlertLevel.Info}
				message="an alert message"
				onDismiss={onDismiss}
				open={true}
			/>
		);
		// When close button pressed
		await user.click(screen.getByTestId("alert-dismiss"));
		// Then onDismiss is invoked
		expect(onDismiss).toHaveBeenCalled();
	});
});
