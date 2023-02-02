import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useArgs } from "@storybook/client-api";
import { Alert, AlertLevel } from "./Alert";
import AlertDoc from "./Alert.mdx";

export default {
	title: "Shared/Alert",
	component: Alert,
	parameters: {
		docs: {
			page: AlertDoc,
		},
	},
} as ComponentMeta<typeof Alert>;

const Template: ComponentStory<typeof Alert> = (args) => {
	const [hookArgs, updateArgs] = useArgs();
	let controlledOnDismiss = args.onDismiss;
	if (typeof args.onDismiss === "string") {
		if (args.onDismiss === "alert") {
			controlledOnDismiss = () => alert("Alert onDismiss triggered");
		} else if (args.onDismiss === "close") {
			controlledOnDismiss = () => updateArgs({ open: false });
		} else if (args.onDismiss === "console.log") {
			controlledOnDismiss = () => console.log("Alert onDismiss triggered");
		}
	}
	return (
		<Alert {...args} onDismiss={controlledOnDismiss} open={hookArgs.open} />
	);
};

export const OpenDefault = Template.bind({});
OpenDefault.argTypes = {
	level: {
		table: {
			disable: true,
		},
	},
	message: {
		table: {
			disable: true,
		},
	},
	onDismiss: {
		table: {
			disable: true,
		},
	},
	open: {
		table: {
			disable: true,
		},
	},
};
OpenDefault.args = {
	message: "This is test content",
	open: true,
};

export const OpenWithArgs = Template.bind({});
OpenWithArgs.argTypes = {
	onDismiss: {
		options: ["alert", "close", "console.log"],
		control: "radio",
	},
};
OpenWithArgs.args = {
	level: AlertLevel.Info,
	message: "This is test content",
	open: true,
};
