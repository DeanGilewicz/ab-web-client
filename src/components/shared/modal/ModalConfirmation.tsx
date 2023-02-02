import { useState } from "react";

import "src/components/shared/modal/ModalConfirmationStyles.css";

import {
	Modal,
	ModalConfirmButton,
	ModalContents,
	ModalOpenButton,
} from "src/components/shared/modal/Modal";

interface ModalConfirmationProps {
	content: React.ReactNode;
	title?: string;
	triggerText: string;
}

export function ModalConfirmation({
	content,
	title,
	triggerText,
}: ModalConfirmationProps) {
	const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

	return (
		<Modal>
			<ModalOpenButton>
				<button className="error">{triggerText}</button>
			</ModalOpenButton>
			<ModalContents dismissFn={() => setIsConfirmed(false)} title={title}>
				<div className="modal-confirmation-content">
					{isConfirmed ? (
						<>{content}</>
					) : (
						<>
							<p>Are you sure you want to perform this action?</p>
							<div className="action-container">
								<ModalConfirmButton>
									<button onClick={() => setIsConfirmed(true)}>Continue</button>
								</ModalConfirmButton>
							</div>
						</>
					)}
				</div>
			</ModalContents>
		</Modal>
	);
}
