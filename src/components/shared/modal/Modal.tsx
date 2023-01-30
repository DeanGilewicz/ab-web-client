import React, {
	cloneElement,
	createContext,
	PropsWithChildren,
	SyntheticEvent,
	useContext,
	useState,
} from "react";
import { createPortal } from "react-dom";

import "src/components/shared/modal/ModalStyles.css";

const callAll =
	(...fns: Function[]) =>
	(...args: any[]) =>
		fns.forEach((fn) => fn && fn(...args));

const ModalContext = createContext<
	PropsWithChildren<
		[isOpen: boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>]
	>
>([false, () => {}]);

function Modal(props: any) {
	const [isOpen, setIsOpen] = useState(false);

	return <ModalContext.Provider value={[isOpen, setIsOpen]} {...props} />;
}

function ModalFormSubmit({ children: child }: { children: JSX.Element }) {
	const [, setIsOpen] = useContext(ModalContext);
	return cloneElement(child, {
		// onSubmit prop provided by form
		onSubmit: callAll(async (e: SyntheticEvent) => {
			// need to receive res in order to close modal upon success
			const modalFormSubmitResult = await child.props.onSubmit(e);
			console.log("modalFormSubmitResult", modalFormSubmitResult);
			// res undefined when there is an error
			if (modalFormSubmitResult) {
				setIsOpen(false);
			}
			return modalFormSubmitResult;
		}),
	});
}

function ModalDismissButton({ children: child }: { children: JSX.Element }) {
	const [, setIsOpen] = useContext(ModalContext);
	return cloneElement(child, {
		onClick: callAll(() => setIsOpen(false), child.props.onClick),
	});
}

function ModalConfirmButton({ children: child }: { children: JSX.Element }) {
	const [, setIsOpen] = useContext(ModalContext);
	// exit early since ModalFormSubmit / form should handle submit
	if (child.props.type === "submit") return child;
	return cloneElement(child, {
		// onClick prop provided by button
		onClick: callAll(async () => {
			// need to receive res in order to close modal upon success
			const modalConfirmButtonResult = await child.props.onClick();
			console.log("modalConfirmButtonResult", modalConfirmButtonResult);
			// res undefined when there is an error
			if (modalConfirmButtonResult) {
				setIsOpen(false);
			}
			return modalConfirmButtonResult;
		}),
	});
}

function ModalOpenButton({ children: child }: { children: JSX.Element }) {
	const [, setIsOpen] = useContext(ModalContext);
	return cloneElement(child, {
		onClick: callAll(() => setIsOpen(true), child.props.onClick),
	});
}

function ModalContentsBase(props: any) {
	const [isOpen] = useContext(ModalContext);
	return <MyModal isOpen={isOpen} {...props} />;
}

function ModalContents({
	title,
	children,
	dismissFn,
	...props
}: {
	title?: string;
	children: React.ReactNode;
	dismissFn?: () => void;
	props?: any;
}) {
	return (
		<ModalContentsBase {...props}>
			<div className="modal-content-dismiss">
				<ModalDismissButton>
					<button onClick={() => (dismissFn ? dismissFn() : undefined)}>
						Close
						{/* <span aria-hidden>×</span> */}
					</button>
				</ModalDismissButton>
			</div>
			<div className="modal-content-header">
				<h3>{title || "Default Title"}</h3>
			</div>
			{children}
		</ModalContentsBase>
	);
}

export {
	Modal,
	ModalConfirmButton,
	ModalContents,
	ModalDismissButton,
	ModalFormSubmit,
	ModalOpenButton,
};

function MyModal({
	children,
	isOpen,
}: {
	children: React.ReactNode;
	isOpen: boolean;
}) {
	// existing DOM element in index.html to attach modal to
	let mount = document.querySelector("#portal-root");
	// for testing we create div if it doesn't exist
	if (!mount) {
		mount = document.createElement("div");
		mount.setAttribute("id", "portal-root");
		document.body.appendChild(mount);
	}

	return createPortal(
		!isOpen ? null : (
			<div data-testid="modal" className="modal">
				<div className="modal-content">
					<div className="modal-body">{children}</div>
				</div>
			</div>
		),
		mount
	);
}
