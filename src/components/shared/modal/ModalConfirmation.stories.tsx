import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ModalConfirmation } from "./ModalConfirmation";

export default {
	title: "Shared/Modal/Confirmation",
	component: ModalConfirmation,
} as ComponentMeta<typeof ModalConfirmation>;

const Template: ComponentStory<typeof ModalConfirmation> = (args) => {
	const {
		content = "Test Modal Content Here",
		title = "Confirmation Modal Title",
		triggerText = "Open Modal",
		...otherArgs
	} = args;
	return (
		<ModalConfirmation
			content={content}
			title={title}
			triggerText={triggerText}
			{...otherArgs}
		/>
	);
};

export const OpenWithArgs = Template.bind({});
OpenWithArgs.argTypes = {
	content: {
		table: {
			disable: true,
		},
	},
	title: { defaultValue: "Modal Title" },
	triggerText: { defaultValue: "Open Modal" },
};
