import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal = ({ isOpen, onClose, children, title }: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white p-6 rounded shadow-lg min-w-[320px] max-w-lg relative"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <button
            className="absolute text-gray-500 transition top-2 right-2 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            <MdClose className="text-xl" />
          </button>
          {title && <h3 className="mb-3 text-lg font-bold">{title}</h3>}
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Modal;
