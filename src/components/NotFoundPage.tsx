import { ApolloError } from "@apollo/client";
import { NavLink } from "react-router-dom";

import "src/components/NotFoundPageStyles.css";

export function NotFoundPage({ error }: { error?: ApolloError | Error }) {
	return (
		<div className="not-found-page">
			<h2>Looks Like You Might Be Lost?</h2>
			<div className="action-container">
				<NavLink className="button success" to="/">
					Go Home
				</NavLink>
			</div>
			{error && (
				<div className="message-container">
					<p>{error.message}</p>
				</div>
			)}
		</div>
	);
}
