import { useProgress } from '@react-three/drei';

export default function Loader() {
  const { progress } = useProgress();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-ink px-6">
      <p className="font-display text-sm tracking-[0.3em] text-headline uppercase">
        Presence Hospitality — Loading experience...
      </p>
      <div className="h-[2px] w-64 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-teal to-violet transition-[width] duration-200 ease-out"
          style={{ width: `${Math.round(progress)}%` }}
        />
      </div>
      <p className="font-mono text-xs text-white/40">{Math.round(progress)}%</p>
    </div>
  );
}
