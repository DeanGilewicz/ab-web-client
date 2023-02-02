import { ComponentMeta, ComponentStory, DecoratorFn } from "@storybook/react";
import { useState } from "react";
import { Modal, ModalContents } from "./Modal";
import ModalDoc from "./Modal.mdx";

export default {
	title: "Shared/Modal",
	component: Modal,
	parameters: {
		docs: {
			page: ModalDoc,
		},
	},
} as ComponentMeta<typeof Modal>;

const ModalWrapper: DecoratorFn = (Story) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<div>
			<Story isOpen={isOpen} setIsOpen={setIsOpen} />
			<button onClick={() => setIsOpen(true)}>Open Modal</button>
		</div>
	);
};

const Template: ComponentStory<typeof Modal> = (args, context) => {
	const { isOpen, setIsOpen } = context;
	return (
		<Modal>
			<ModalContents
				children={
					<div style={{ color: "#585858", textAlign: "center" }}>
						Test Modal Content
					</div>
				}
				isOpen={isOpen}
				dismissFn={() => setIsOpen(false)}
				{...args}
			/>
		</Modal>
	);
};

export const OpenWithDecorator = Template.bind({});
OpenWithDecorator.decorators = [ModalWrapper];

export const OpenWithArgs = Template.bind({});
OpenWithArgs.argTypes = {
	dismissFn: {
		table: {
			disable: true,
		},
	},
};
OpenWithArgs.args = {
	isOpen: true,
	dismissFn: () => alert("dismissFn triggered"),
};
