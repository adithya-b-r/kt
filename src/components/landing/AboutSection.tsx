import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-kutumba-dark-text">About KutumbaTree</h2>
          <p className="text-lg text-kutumba-muted leading-relaxed">
            KutumbaTree helps Indian families preserve their heritage by organizing family connections,
            cultural traditions, and memories in one place. Build your tree, share it with loved ones,
            and keep your story alive for future generations.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-kutumba-border shadow-kutumba">
              <p className="text-sm text-kutumba-muted">Families Connected</p>
              <p className="text-2xl font-bold text-kutumba-maroon select-none blur-sm">50,000+</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-kutumba-border shadow-kutumba">
              <p className="text-sm text-kutumba-muted">Cultural Traditions</p>
              <p className="text-2xl font-bold text-kutumba-teal select-none blur-sm">200+</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-kutumba-muted">
            <span className="px-3 py-1 rounded-full bg-white border border-kutumba-border">Regional Languages</span>
            <span className="px-3 py-1 rounded-full bg-white border border-kutumba-border">Festival Reminders</span>
            <span className="px-3 py-1 rounded-full bg-white border border-kutumba-border">Secure Sharing</span>
          </div>
        </div>

        <div className="relative w-full h-90 rounded-2xl overflow-hidden shadow-kutumba border border-kutumba-border bg-white">
          <Image
            src="/kutumba-tree-logo.png"
            alt="KutumbaTree community"
            fill
            className="object-contain p-8 scale-120"
            sizes="(min-width: 1024px) 80vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}