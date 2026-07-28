import Link from "next/link";
import type { Metadata } from "next";
import { Brand } from "@/components/ui/Brand";
import { decodeInvitePayload } from "@/lib/engine";

function article(name: string): string {
  return /^[aeiou]/i.test(name) ? "An" : "A";
}

export function generateMetadata({ searchParams }: { searchParams: { invite?: string } }): Metadata {
  const invite = searchParams.invite ? decodeInvitePayload(searchParams.invite) : null;
  if (!invite) {
    return { title: "Invite — Ignite Spark Read" };
  }
  const title = `${article(invite.u)} ${invite.u} took a Spark Read on you`;
  const description = `As ${article(invite.p).toLowerCase()} ${invite.p}, they scored ${invite.s}/100 with you — and sealed 3 guesses about how you'd answer. Take your own read to find out how right they were.`;
  const images = [{ url: "/og/og-image.png", width: 1200, height: 630, alt: title }];
  return {
    title,
    description,
    openGraph: { title, description, images, type: "website" },
    twitter: { title, description, images, card: "summary_large_image" },
  };
}

export default function ReadInvitePage({ searchParams }: { searchParams: { invite?: string } }) {
  const invite = searchParams.invite ? decodeInvitePayload(searchParams.invite) : null;

  return (
    <div className="relative z-[1] mx-auto flex min-h-dvh w-full max-w-app flex-col px-5 py-sp-3 md:min-h-[640px] md:max-h-[85dvh] md:max-w-[560px] md:overflow-y-auto md:rounded md:border md:border-line md:bg-[rgba(43,24,48,.45)] md:px-8 md:py-8 md:shadow-[0_30px_90px_rgba(0,0,0,.5)] lg:max-w-[600px]">
      <div className="mb-sp-2 flex min-h-[32px] items-center justify-between">
        <Brand />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-[18px] text-center">
        {invite ? (
          <>
            <div className="text-[3rem]">🔒</div>
            <h1 className="font-serif text-title font-normal leading-[1.18]">
              {article(invite.u)} {invite.u} took a Spark Read on you.
            </h1>
            <p className="mb-0 max-w-[32ch] text-body text-ivory-dim">
              As {article(invite.p).toLowerCase()} {invite.p}, they scored{" "}
              <strong className="text-ivory">{invite.s}/100</strong> with you — and
              sealed 3 guesses about how you&rsquo;d answer. Take your own read to find out how right they were.
            </p>
          </>
        ) : (
          <>
            <div className="text-[3rem]">✨</div>
            <h1 className="font-serif text-title font-normal leading-[1.18]">This invite link isn&rsquo;t valid.</h1>
            <p className="mb-0 max-w-[32ch] text-body text-ivory-dim">
              It may be incomplete or expired. Start your own Spark Read instead.
            </p>
          </>
        )}
        <Link
          href="/"
          className="w-full rounded-full px-7 py-4 text-center font-sans font-semibold text-base text-night bg-gradient-to-r from-[var(--ember-1)] to-[var(--ember-2)] shadow-[0_8px_28px_rgba(255,107,74,.26)] transition-transform active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ivory"
        >
          Start your Spark Read
        </Link>
      </div>
    </div>
  );
}
