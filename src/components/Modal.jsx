import { createPortal } from "react-dom";

const Modal = ({ children, isOpen, onClose }) => {
  const modalRoot = document.getElementById("modal-root");

  if (!isOpen || !modalRoot) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={onClose}>
          x
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
