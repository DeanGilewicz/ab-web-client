import { createPortal } from "react-dom";

import "src/components/shared/AlertStyles.css";

export enum AlertLevel {
	Error = "Error",
	Info = "Info",
	Success = "Success",
	Warning = "Warning",
}

const { Error, Info, Success, Warning } = AlertLevel;

export interface AlertProps {
	level: AlertLevel;
	message: string;
	onDismiss: () => void;
	open: boolean;
}

enum Palette {
	Error = "#e52418",
	Info = "#0094fb",
	Success = "#14e54b",
	Text = "#FFFFFF",
	Warning = "#fbaa00",
}

interface AlertStylesValue {
	bgColor: Palette;
	color: Palette;
}

const AlertStyles: Record<AlertLevel, AlertStylesValue> = {
	[Error]: {
		bgColor: Palette.Error,
		color: Palette.Text,
	},
	[Info]: {
		bgColor: Palette.Info,
		color: Palette.Text,
	},
	[Success]: {
		bgColor: Palette.Success,
		color: Palette.Text,
	},
	[Warning]: {
		bgColor: Palette.Warning,
		color: Palette.Text,
	},
};

export function Alert(props: AlertProps) {
	const { level = Info, message, onDismiss, open } = props;
	const { bgColor, color } = AlertStyles[level];

	return createPortal(
		<div className={`alert ${open ? "alert-active" : ""}`}>
			{open && (
				<div className="alert-content" style={{ backgroundColor: bgColor }}>
					<p style={{ color }}>{message}</p>
					<button data-testid="alert-dismiss" onClick={() => onDismiss()}>
						&times;
					</button>
				</div>
			)}
		</div>,
		document.body
	);
}
