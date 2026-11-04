import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "404 — Lost in the arcade" };

export default function NotFound() {
  return (
    <div className="shell flex min-h-[72vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-[clamp(70px,16vw,170px)] font-black leading-none text-white/10">
        404
      </p>
      <h1 className="-mt-4 font-display text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl">
        This cabinet isn&apos;t plugged in
      </h1>
      <p className="mt-3 max-w-md text-sm text-white/55">
        The page you tried to load does not exist. The arcade, however, is very much open.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link href="/games" className="btn btn-primary">
          <Icon name="grid" size={15} /> <span>Browse all games</span>
        </Link>
        <Link href="/" className="btn btn-ghost">
          <Icon name="home" size={15} /> <span>Back to arcade</span>
        </Link>
      </div>
    </div>
  );
}
