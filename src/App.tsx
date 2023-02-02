import { NavLink, Route, Routes } from "react-router-dom";

import "src/AppStyles.css";

import { AlertContextProvider } from "src/contexts/AlertContext";
import { ErrorContextProvider } from "src/contexts/ErrorContext";

import { AuthorPage } from "src/components/AuthorPage";
import { AuthorsPage } from "src/components/AuthorsPage";
import { BookPage } from "src/components/BookPage";
import { BooksPage } from "src/components/BooksPage";
import { HomePage } from "src/components/HomePage";
import { NotFoundPage } from "src/components/NotFoundPage";
import ErrorBoundary from "src/components/shared/ErrorBoundary";

function App() {
	return (
		<div className="app">
			<header className="app-header">
				<nav>
					<ul>
						<li>
							<NavLink data-testid="nav-home" to="/">
								Home
							</NavLink>
						</li>
						<li>
							<NavLink data-testid="nav-authors" to="/authors">
								Authors
							</NavLink>
						</li>
						<li>
							<NavLink data-testid="nav-books" to="/books">
								Books
							</NavLink>
						</li>
					</ul>
				</nav>
			</header>
			<main>
				<ErrorContextProvider>
					<ErrorBoundary>
						<AlertContextProvider>
							<Routes>
								<Route path="/" element={<HomePage />} />
								<Route path="authors" element={<AuthorsPage />} />
								<Route path="authors/:authorId" element={<AuthorPage />} />
								<Route path="books" element={<BooksPage />} />
								<Route path="books/:bookId" element={<BookPage />} />
								<Route path="*" element={<NotFoundPage />} />
							</Routes>
						</AlertContextProvider>
					</ErrorBoundary>
				</ErrorContextProvider>
			</main>
			<footer className="app-footer">
				<p>&copy; Author Books 2023</p>
			</footer>
		</div>
	);
}

export default App;
