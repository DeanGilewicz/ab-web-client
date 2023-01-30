import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
	children?: ReactNode;
}

interface State {
	hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(_: Error): State {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return <h1>Sorry.. there was an error</h1>;
		}

		return this.props.children;
	}
}
