import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NotFoundPage } from "./NotFoundPage";

export default {
	title: "Page/Not Found",
	component: NotFoundPage,
	argTypes: {
		error: {
			table: {
				disable: true,
			},
		},
	},
} as ComponentMeta<typeof NotFoundPage>;

const Template: ComponentStory<typeof NotFoundPage> = (args) => {
	return (
		<MemoryRouter initialEntries={["/"]}>
			<Routes>
				<Route path={"*"} element={<NotFoundPage {...args} />} />
			</Routes>
		</MemoryRouter>
	);
};

export const Default = Template.bind({});

export const WithError = Template.bind({});
WithError.args = {
	error: { message: "An error message", name: "example error" },
};
