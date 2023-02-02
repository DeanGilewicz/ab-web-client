import { ComponentMeta, ComponentStory } from "@storybook/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./HomePage";

export default {
	title: "Page/Home",
	component: HomePage,
} as ComponentMeta<typeof HomePage>;

const Template: ComponentStory<typeof HomePage> = () => {
	return (
		<MemoryRouter initialEntries={["/"]}>
			<Routes>
				<Route path={"/"} element={<HomePage />} />
			</Routes>
		</MemoryRouter>
	);
};

export const Default = Template.bind({});
