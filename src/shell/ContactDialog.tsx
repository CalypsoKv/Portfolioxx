import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { ArrowUpRight, Check, Copy, Radio, X } from "lucide-react";

type ContactDialogProps = {
  open: boolean;
  onClose: () => void;
  initialService?: string;
};
type BriefDraft = {
  name: string;
  email: string;
  service: string;
  budget: string;
  brief: string;
};
const DRAFT_KEY = "itv_inquiry_draft";
const CONTACT_EMAIL = "jahandms60@gmail.com";
const blankDraft: BriefDraft = {
  name: "",
  email: "",
  service: "",
  budget: "",
  brief: "",
};
const services = [
  "Words & editorial",
  "Product & narrative",
  "Research & systems",
  "Brand & web systems",
  "Play & possibilities",
  "Something else entirely",
];

function readDraft(): BriefDraft {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(DRAFT_KEY) || "null",
    );
    if (!value || typeof value !== "object") return { ...blankDraft };
    const result = { ...blankDraft };
    for (const key of Object.keys(result) as (keyof BriefDraft)[]) {
      const saved = (value as Record<string, unknown>)[key];
      if (typeof saved === "string") result[key] = saved;
    }
    return result;
  } catch {
    return { ...blankDraft };
  }
}

export default function ContactDialog({
  open,
  onClose,
  initialService,
}: ContactDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<BriefDraft>(readDraft);
  const [restored] = useState(() => Object.values(readDraft()).some(Boolean));
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [composed, setComposed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      if (initialService) {
        const match =
          services.find((service) =>
            service.toLowerCase().startsWith(initialService.toLowerCase()),
          ) || initialService;
        setDraft((current) => ({ ...current, service: match }));
      }
    } else if (!open && dialog.open) dialog.close();
  }, [open, initialService]);

  useEffect(() => {
    try {
      if (Object.values(draft).some(Boolean))
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      else sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* A blocked browser store should not block the inquiry. */
    }
  }, [draft]);

  function update(field: keyof BriefDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setComposed(false);
  }

  function closeFromBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      event.currentTarget.close();
    }
  }

  function composeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const subject = `A new signal: ${draft.service || "Project inquiry"} — ${draft.name.trim()}`;
    const body = [
      "Hi Jahan,",
      "",
      draft.brief.trim(),
      "",
      `Name: ${draft.name.trim()}`,
      `Reply to: ${draft.email.trim()}`,
      `Frequency: ${draft.service || "Let’s find the right frequency"}`,
      ...(draft.budget ? [`Budget: ${draft.budget}`] : []),
      "",
      "Sent from the Interdimensional TV inquiry console.",
    ].join("\n");
    const link = document.createElement("a");
    link.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.click();
    setComposed(true);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="contact-dialog"
      aria-labelledby="contact-heading" data-lenis-prevent
      aria-describedby="contact-description"
      onClick={closeFromBackdrop}
      onClose={() => {
        if (open) onClose();
      }}
    >
      <div className="contact-inner">
        <div className="contact-topline">
          <span>
            <Radio size={14} aria-hidden="true" /> OPEN A CHANNEL · DIRECT
            INQUIRY
          </span>
          <button
            type="button"
            className="contact-close"
            aria-label="Close inquiry"
            onClick={() => dialogRef.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="contact-heading">
          Have something on your <em>wavelength?</em>
        </h2>
        <p id="contact-description" className="contact-intro">
          A clearer story, a complex question, a world worth building. Tell me a
          little about what you have in mind.
        </p>
        <form onSubmit={composeEmail} className="contact-form">
          <div className="contact-field-row">
            <label className="contact-field">
              Your name <span aria-hidden="true">*</span>
              <input
                name="name"
                autoComplete="name"
                required
                maxLength={120}
                value={draft.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="How should I call you?"
              />
            </label>
            <label className="contact-field">
              Your email <span aria-hidden="true">*</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={200}
                value={draft.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="you@yourstudio.com"
              />
            </label>
          </div>
          <div className="contact-field-row">
            <label className="contact-field">
              Choose a frequency{" "}
              <span className="contact-optional">Optional</span>
              <select
                name="service"
                value={draft.service}
                onChange={(event) => update("service", event.target.value)}
              >
                <option value="">Let’s find the right one</option>
                {draft.service && !services.includes(draft.service) && (
                  <option value={draft.service}>{draft.service}</option>
                )}
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>
            <label className="contact-field">
              Budget range <span className="contact-optional">Optional</span>
              <select
                name="budget"
                value={draft.budget}
                onChange={(event) => update("budget", event.target.value)}
              >
                <option value="">Open to a conversation</option>
                <option>Under $1,000</option>
                <option>$1,000–$3,000</option>
                <option>$3,000–$5,000</option>
                <option>$5,000+</option>
                <option>Ongoing collaboration</option>
              </select>
            </label>
          </div>
          <label className="contact-field contact-brief">
            A short brief <span aria-hidden="true">*</span>
            <textarea
              name="brief"
              required
              minLength={10}
              maxLength={6000}
              rows={4}
              value={draft.brief}
              onChange={(event) => update("brief", event.target.value)}
              placeholder="What are you working on? What would a useful outcome look like? A rough signal is enough."
            />
          </label>
          <div className="contact-compose-row">
            <button type="submit" className="contact-submit">
              Compose email <ArrowUpRight size={20} aria-hidden="true" />
            </button>
            <p className="contact-send-note">
              Opens your email app. Your brief is not sent until you send it
              there.
            </p>
          </div>
          {composed && (
            <p className="contact-status" role="status">
              Your email draft is ready to open. Send it in your email app to
              deliver your brief, or copy the address below if no app opens.
            </p>
          )}
        </form>
        <div className="contact-direct">
          <div>
            <span className="contact-direct-label">
              PREFER A DIRECT SIGNAL?
            </span>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
          <button
            type="button"
            className="contact-copy"
            onClick={copyEmail}
            aria-label="Copy email address"
          >
            {copyState === "copied" ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}{" "}
            {copyState === "copied" ? "Copied" : "Copy email"}
          </button>
        </div>
        {copyState === "failed" && (
          <p className="contact-status" role="status">
            Clipboard is unavailable here. Select the email address above to
            copy it.
          </p>
        )}
        <div className="contact-privacy">
          <span>
            {restored
              ? "Your draft was restored in this tab."
              : "Your draft stays in this browser tab."}{" "}
            Nothing is uploaded.
          </span>
          {Object.values(draft).some(Boolean) && (
            <button
              type="button"
              onClick={() => {
                setDraft({ ...blankDraft });
                setComposed(false);
              }}
            >
              Clear draft
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
