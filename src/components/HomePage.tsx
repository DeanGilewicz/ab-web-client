import "src/components/HomePageStyles.css";

export function HomePage() {
	return (
		<div className="home-page">
			<h2>Welcome to Author Books</h2>
			<p>
				This example application allows users to create authors or books and to
				associate them to each other. Each book may only have 1 author but an
				author can have many books.
			</p>
		</div>
	);
}
