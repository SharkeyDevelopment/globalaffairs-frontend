import { ArrowRight, FileSearch, Globe2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=80';

const FEATURES = [
  {
    icon: FileSearch,
    title: 'Multi-document search',
    description:
      'Ask questions across your entire policy brief library and get answers grounded in source material.',
  },
  {
    icon: Globe2,
    title: 'Global affairs context',
    description:
      'Built for teams navigating complex international policy, trade, and regulatory landscapes.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-ready',
    description:
      'Secure access controls and citation-backed responses you can trust for high-stakes decisions.',
  },
] as const;

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8f9fa] text-[#202124]">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4285f4] via-[#34a853] to-[#fbbc04] shadow-sm">
              <Globe2 className="size-4.5 text-white" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium tracking-tight">Policy Intelligence Hub</p>
              <p className="text-[11px] text-[#5f6368]">Global Affairs</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-9 rounded-full border-[#dadce0] px-5 text-sm font-medium text-[#1a73e8] hover:bg-[#f6fafe] hover:text-[#174ea6]"
            onClick={() => onLogin({ name: 'John Smith', email: 'jsmith@google.com' })}
          >
            Sign in
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 min-h-[calc(100vh-4rem)]">
          <img
            src={HERO_IMAGE}
            alt=""
            aria-hidden
            className="size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1d3a]/55 via-[#0b1d3a]/35 to-[#f8f9fa]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(66,133,244,0.18),transparent_55%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-6 py-16 md:py-24">
          <div
            className={cn(
              'w-full max-w-3xl rounded-[28px] border border-white/70 bg-white/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm',
              'md:p-12',
            )}
          >
            <span className="inline-flex items-center rounded-full bg-[#e8f0fe] px-3 py-1 text-xs font-medium tracking-wide text-[#1967d2] uppercase">
              Demo
            </span>

            <h1 className="mt-6 text-4xl font-normal leading-[1.15] tracking-tight text-[#202124] md:text-[3.25rem]">
              GA Policy
              <span className="block font-medium text-[#1a73e8]">Intelligence Hub</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#5f6368] md:text-xl">
              Multi-document RAG over policy briefs. Search, synthesize, and cite answers across
              your global affairs knowledge base in seconds.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row items-center">
              <Button
                size="lg"
                className="h-12 flex flex-row items-center rounded-full bg-[#1a73e8] px-8 text-base font-medium text-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:bg-[#1765cc]"
                onClick={() => onLogin({ name: 'John Smith', email: 'jsmith@google.com' })}
              >
                <span>Get started</span>
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Button>
            </div>

            <p className="mt-6 text-sm text-[#80868b]">
              Trusted by policy analysts for fast, citation-backed research.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative bg-[#f8f9fa] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-normal tracking-tight text-[#202124] md:text-4xl">
              Built for policy teams
            </h2>
            <p className="mt-4 text-lg text-[#5f6368]">
              Everything you need to move from scattered briefs to actionable intelligence.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-3xl border border-[#e8eaed] bg-white p-8 shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] transition-shadow hover:shadow-[0_4px_8px_3px_rgba(60,64,67,0.15),0_1px_3px_rgba(60,64,67,0.3)]"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#e8f0fe] text-[#1a73e8]">
                  <Icon className="size-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 text-xl font-medium text-[#202124]">{title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#5f6368]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8eaed] bg-white px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[#5f6368] sm:flex-row">
          <p>© {new Date().getFullYear()} GA Policy Intelligence Hub</p>
          <p className="text-[#80868b]">Photo: NASA / Unsplash</p>
        </div>
      </footer>
    </div>
  );
}
