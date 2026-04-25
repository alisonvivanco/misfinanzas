import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background gradient-mesh-soft py-12 px-6">
      <div className="container max-w-3xl">
        <Link href="/" className="inline-flex items-baseline gap-1 mb-8">
          <span className="font-bold text-lg tracking-tight">AlisonVivanco</span>
          <span className="font-bold text-lg tracking-tight gradient-text">.cl</span>
        </Link>
        <article className="prose prose-sm max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mb-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ul]:mb-4">
          {children}
        </article>
      </div>
    </div>
  );
}
