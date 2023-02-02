import { createContext, useContext, useState } from "react";

interface IGraphQlError {
	locations: {
		column: number;
		line: number;
	}[];
	message: string;
	path: string[];
}

interface ErrorContextProps {
	setErrorMessage: (messages: IGraphQlError[]) => void;
	errorMessage: string;
}

export const ErrorContext = createContext<ErrorContextProps>({
	setErrorMessage: (messages) => {},
	errorMessage: "",
});

function handleErrors(errorsArray: IGraphQlError[]): string {
	return errorsArray.map((err) => err.message).join(",");
}

export function ErrorContextProvider(props: any) {
	const [message, setMessage] = useState("");
	const globalErrorContext: ErrorContextProps = {
		setErrorMessage: (messages) => setMessage(handleErrors(messages)),
		errorMessage: message,
	};

	return (
		<ErrorContext.Provider value={globalErrorContext}>
			{props.children}
		</ErrorContext.Provider>
	);
}

export const useErrorContext = () => useContext(ErrorContext);
