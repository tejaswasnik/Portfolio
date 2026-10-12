"use client";

import { createContext, useCallback, useContext, useState } from "react";
import ContactModal from "./ContactModal";

const ContactModalContext = createContext(() => {});

/**
 * Lets any descendant (server or client component — see
 * MessageMeTrigger/LetsTalkTrigger) open the single contact modal
 * mounted here, instead of each page building its own Dialog instance.
 * @returns {() => void}
 */
export function useOpenContactModal() {
  return useContext(ContactModalContext);
}

/**
 * Mounts the contact modal once per page (via PageFrame) and exposes a
 * way to open it through context, so the "Message me" cell and the
 * "Let's Talk" CTA — both deep in server-rendered markup — can trigger
 * the same client-side modal without each page wiring its own state.
 */
export default function ContactModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <ContactModalContext.Provider value={openModal}>
      {children}
      <ContactModal open={open} onClose={closeModal} />
    </ContactModalContext.Provider>
  );
}
