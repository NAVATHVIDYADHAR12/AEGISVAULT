'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenText, CheckCircle2, Info, LockKeyhole, Network, ShieldCheck, Volume2, VolumeX, X } from 'lucide-react';

const overview = 'Aegis Vault is a secure workspace for teams to manage credentials and the decisions around them. Create a project to group related secrets and people. Add secret values through the secure form. Project membership and organization roles determine what each person can do. Important actions can be reviewed in the audit history. We created Aegis to reduce credential sprawl across code, chat, and documents, and to keep access and its evidence connected. Start by creating a project, then add a secret and invite teammates only when you are ready.';

export default function ProjectDescription({ onClose }) {
  const [speaking, setSpeaking] = useState(false);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      window.speechSynthesis?.cancel();
      previouslyFocused?.focus?.();
    };
  }, []);

  function toggleReadAloud() {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new window.SpeechSynthesisUtterance(overview);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="project-about-backdrop"
        role="presentation"
        onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.section
          ref={dialogRef}
          className="project-about-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-about-title"
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.985 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="project-about-header">
            <div className="project-about-mark"><ShieldCheck size={19} /></div>
            <div>
              <p>PROJECT DESCRIPTION · AEGIS VAULT</p>
              <h2 id="project-about-title">A secure home for team credentials.</h2>
            </div>
            <button ref={closeButtonRef} type="button" className="project-about-close" onClick={onClose} aria-label="Close project description">
              <X size={18} />
            </button>
          </header>

          <div className="project-about-content">
            <p className="project-about-lede">Aegis Vault brings credentials, access decisions, and activity history into one workspace—so teams can collaborate without losing control of sensitive values.</p>

            <div className="project-about-points">
              <article>
                <span><Info size={15} /></span>
                <div><h3>What is this project?</h3><p>A team vault for organizing secrets by project, controlling who can use them, and keeping the work around each credential in one place.</p></div>
              </article>
              <article>
                <span><Network size={15} /></span>
                <div><h3>How does it work?</h3><p>Create a project, add credentials through the secret form, and invite teammates with suitable roles. Review access activity and changes from the workspace navigation.</p></div>
              </article>
              <article>
                <span><LockKeyhole size={15} /></span>
                <div><h3>Why did we create it?</h3><p>Credentials often end up scattered across code, chats, and documents. Aegis is designed to reduce that sprawl and connect access decisions with a reviewable history.</p></div>
              </article>
            </div>

            <div className="project-about-note"><CheckCircle2 size={15} /><span>New workspaces start empty. Create a project first; dashboard counts reflect your saved data.</span></div>
          </div>

          <footer className="project-about-footer">
            <button type="button" className="project-about-read" onClick={toggleReadAloud}>
              {speaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
              {speaking ? 'Stop reading' : 'Read overview aloud'}
            </button>
            <button type="button" className="project-about-dismiss" onClick={onClose}>Close</button>
          </footer>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
