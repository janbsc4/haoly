import { useState, type SyntheticEvent, type RefObject } from "react";
import { FEEDBACK_MAX_MESSAGE, feedbackKinds, type FeedbackKind } from "../../shared/feedback";
import { sendFeedback } from "../lib/feedbackClient";
import type { Messages } from "../lib/messages";
import type { Locale } from "../types";
import { AppIcon } from "./AppIcon";
import { Modal } from "./Modal";

interface FeedbackDialogProps {
  m: Messages["feedback"];
  locale: Locale;
  context: string;
  onClose: () => void;
  returnFocus?: RefObject<HTMLButtonElement | null>;
}

type SendState = "idle" | "sending" | "sent" | "rate-limited" | "error";

export function FeedbackDialog({ m, locale, context, onClose, returnFocus }: FeedbackDialogProps) {
  const [kind, setKind] = useState<FeedbackKind>("bug");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SendState>("idle");

  const submit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (!message.trim() || state === "sending") return;
    setState("sending");
    try {
      await sendFeedback({ kind, message: message.trim(), locale, context });
      setState("sent");
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : null;
      setState(code === "feedback/rate-limited" ? "rate-limited" : "error");
    }
  };

  return (
    <Modal
      className="feedback-dialog"
      labelledBy="feedback-title"
      onDismiss={onClose}
      dismissible={state !== "sending"}
      returnFocus={returnFocus}
    >
      <div className="modal-heading">
        <h2 id="feedback-title">{m.title}</h2>
        <button type="button" aria-label={m.closeAria} onClick={onClose}><AppIcon name="close" /></button>
      </div>
      {state === "sent" ? (
        <>
          <p role="status">{m.sent}</p>
          <button type="button" className="button button-primary" onClick={onClose}>{m.done}</button>
        </>
      ) : (
        <form onSubmit={(event) => void submit(event)}>
          <p>{m.intro}</p>
          <fieldset className="feedback-kinds">
            <legend>{m.kindLabel}</legend>
            {feedbackKinds.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="feedback-kind"
                  value={option}
                  checked={kind === option}
                  onChange={() => setKind(option)}
                />
                <span>{m.kinds[option]}</span>
              </label>
            ))}
          </fieldset>
          <label className="feedback-message">
            <span>{m.messageLabel}</span>
            <textarea
              value={message}
              maxLength={FEEDBACK_MAX_MESSAGE}
              rows={6}
              required
              placeholder={m.placeholder[kind]}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <p className="feedback-privacy">{m.privacy}</p>
          {state === "error" || state === "rate-limited" ? (
            <p className="feedback-error" role="alert">
              {state === "rate-limited" ? m.rateLimited : m.failed}
            </p>
          ) : null}
          <button
            type="submit"
            className="button button-primary"
            disabled={!message.trim() || state === "sending"}
          >
            {state === "sending" ? m.sending : m.send}
          </button>
        </form>
      )}
    </Modal>
  );
}
