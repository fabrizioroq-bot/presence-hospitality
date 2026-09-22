import ContactForm from './ContactForm';

const STEPS = [
  {
    eyebrow: '01',
    title: 'We understand your hotel',
    body: 'We assess your current operation: systems, team, and the guest journey. No commitment, no friction.',
  },
  {
    eyebrow: '02',
    title: 'We connect everything in one place',
    body: 'PMS, payments, guest communication — all integrated into a single source of truth. No more scattered spreadsheets.',
  },
  {
    eyebrow: '03',
    title: 'We train and launch',
    body: 'Your team trained, a controlled pilot, zero surprises.',
  },
  {
    eyebrow: '04',
    title: "You're live — and improving",
    body: 'Implementation in weeks, not months. Low cost, full visibility, scalable whenever you decide.',
  },
];

export default function FallbackStatic() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <section className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-xs tracking-[0.5em] text-teal">FRONT OFFICE AS A SERVICE</p>
        <h1 className="font-display text-4xl font-semibold text-headline md:text-6xl">
          Presence Hospitality
        </h1>
        <p className="max-w-md text-white/60">
          Remote, holographic front-office management for boutique hotels — run from a central
          hub.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-teal/60">
          A pilot for RB Horeca
        </p>
      </section>

      <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-24">
        {STEPS.map((step, i) => (
          <div
            key={step.eyebrow}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-panel/70 px-6 py-6 shadow-[0_20px_60px_-15px_rgba(45,212,191,0.2)]"
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-teal via-violet to-teal" />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-8xl font-bold leading-none text-white/[0.05]"
            >
              {step.eyebrow}
            </span>
            <div className="relative flex items-center gap-3">
              <span className="font-mono text-xs tracking-[0.35em] text-teal">{step.eyebrow}</span>
              <div className="flex gap-1.5">
                {STEPS.map((_, dotIndex) => (
                  <span
                    key={dotIndex}
                    className={`h-1 w-4 rounded-full ${
                      dotIndex === i ? 'bg-gradient-to-r from-teal to-violet' : 'bg-white/15'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h2 className="relative mt-2 font-display text-xl font-semibold text-headline md:text-2xl">
              {step.title}
            </h2>
            <p className="relative mt-2 text-sm text-white/70 md:text-base">{step.body}</p>
          </div>
        ))}
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-teal/25 bg-panel/80 p-6">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
