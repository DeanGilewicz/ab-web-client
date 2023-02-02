import { createContext, PropsWithChildren, useContext, useState } from "react";

import { Alert, AlertLevel, AlertProps } from "src/components/shared/Alert";

export interface AlertContextProps {
	showError: (message: string) => void;
	showInfo: (message: string) => void;
	showSuccess: (message: string) => void;
	showWarning: (message: string) => void;
}

export const AlertContext = createContext<AlertContextProps>({
	showError: () => {},
	showInfo: () => {},
	showSuccess: () => {},
	showWarning: () => {},
});

export function AlertContextProvider({ children }: PropsWithChildren<unknown>) {
	const [alertState, setAlertState] = useState<AlertProps>({} as AlertProps);

	const onAlertDismiss = () =>
		setAlertState({ message: "", open: false } as AlertProps);

	const commonAlertProps: Pick<AlertProps, "open" | "onDismiss"> = {
		onDismiss: onAlertDismiss,
		open: true,
	};

	const value: AlertContextProps = {
		showError: (message) =>
			setAlertState({ ...commonAlertProps, level: AlertLevel.Error, message }),
		showWarning: (message) =>
			setAlertState({
				...commonAlertProps,
				level: AlertLevel.Warning,
				message,
			}),
		showSuccess: (message) =>
			setAlertState({
				...commonAlertProps,
				level: AlertLevel.Success,
				message,
			}),
		showInfo: (message) =>
			setAlertState({ ...commonAlertProps, level: AlertLevel.Info, message }),
	};

	return (
		<AlertContext.Provider value={value}>
			{children}
			<Alert {...alertState} />
		</AlertContext.Provider>
	);
}

export function useAlertContext() {
	return useContext(AlertContext);
}
