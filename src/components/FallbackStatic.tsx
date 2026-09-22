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
      </section>

      <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-24">
        {STEPS.map((step) => (
          <div
            key={step.eyebrow}
            className="rounded-2xl border border-teal/20 bg-panel/60 px-6 py-6"
          >
            <span className="font-mono text-xs tracking-[0.35em] text-teal">{step.eyebrow}</span>
            <h2 className="mt-2 font-display text-xl font-semibold text-headline md:text-2xl">
              {step.title}
            </h2>
            <p className="mt-2 text-sm text-white/70 md:text-base">{step.body}</p>
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
