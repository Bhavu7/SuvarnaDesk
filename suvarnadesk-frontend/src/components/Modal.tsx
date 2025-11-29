import React, { ReactNode } from "react";
import { MdClose } from "react-icons/md";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded shadow-lg min-w-[300px] relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          title="Close modal"
          className="absolute text-gray-500 transition top-2 right-2 hover:text-gray-700 focus:outline-none focus:ring-0"
        >
          <MdClose className="text-xl" />
        </button>
        {title && <h3 className="mb-3 text-lg font-bold">{title}</h3>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
