'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const languages = ["Hindi", "English", "Gujarati", "Tamil", "Bengali"];

export default function HeroSection() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleContinue = () => {
    if (firstName && lastName && email) {
      router.push(`/register?fname=${encodeURIComponent(firstName)}&lname=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}`);
    } else {
      // Basic validation feedback or just push anyway and let register handle it?
      // Better to push what we have.
      router.push(`/register?fname=${encodeURIComponent(firstName)}&lname=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <section id="home" className="min-h-screen bg-gradient-nature flex items-center relative overflow-hidden pt-0 pb-16">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150">
          <Image
            src="/kutumba-tree-logo.png"
            alt=""
            fill
            className="object-contain grayscale"
            sizes="600px"
            priority
          />
        </div>
        <div className="absolute top-20 right-20 w-32 h-32 border border-kutumba-teal/20 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-kutumba-green/20 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-kutumba-gold/10 rounded-full blur-xl"></div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold text-kutumba-dark-text leading-tight">
              Build & Discover Your
              <br />
              <span className="text-kutumba-maroon">Family&apos;s Story</span>
            </h1>

            <p className="text-lg sm:text-xl text-kutumba-muted max-w-lg leading-relaxed">
              Trace your roots, connect with family members across India, track &
              document your ancestral & cultural heritage
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="bg-kutumba-green/10 text-kutumba-green border border-kutumba-green/30 px-3 py-1 rounded-full text-sm font-medium">
              ✓ 75 Free Members
            </span>
            <span className="bg-kutumba-teal/10 text-kutumba-teal border border-kutumba-teal/30 px-3 py-1 rounded-full text-sm font-medium">
              ✓ 28 Indian States
            </span>
            <span className="bg-kutumba-gold/10 text-kutumba-gold border border-kutumba-gold/30 px-3 py-1 rounded-full text-sm font-medium">
              ✓ Cultural Integration
            </span>
          </div>

          <div className="flex flex-col font-semibold sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex items-center duration-300 justify-center bg-kutumba-maroon hover:bg-white border-2 hover:text-orange-900 hover:border-orange-900 text-white shadow-kutumba px-8 py-3 text-lg rounded-md"
            >
              Start Free Family Tree
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center border-2 justify-center hover:text-orange-900 border-kutumba-border text-kutumba-dark-text hover:bg-white duration-300 px-8 py-3 text-lg rounded-md"
            >
              View Premium Features
            </Link>
          </div>

          <div className="pt-4">
            <p className="text-kutumba-muted mb-3">Available in 10 Indian languages</p>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="text-sm blur-xs select-none text-kutumba-muted bg-kutumba-light-teal/10 px-3 py-1 rounded-full"
                >
                  {lang}
                </span>
              ))}
              <span className="text-sm text-kutumba-muted">+5 more</span>
            </div>
          </div>
        </div>

        <div className="lg:justify-self-end w-full max-w-md">
          <div className="relative shadow-kutumba border border-kutumba-border bg-white/90 backdrop-blur-sm rounded-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white border border-kutumba-gold/30 shadow-sm rounded-full px-3 py-2 z-10 w-max">
              <span className="text-xs font-bold text-kutumba-dark-text uppercase tracking-wide">Early Access</span>
              <span className="bg-kutumba-gold text-white text-[10px] px-2 py-0 rounded-full font-bold uppercase tracking-wider">Beta</span>
            </div>
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-kutumba-dark-text mb-2">
                  Start building your family tree now
                </h3>
                <p className="text-kutumba-muted">Begin with 75 family members for Free</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="px-4 py-3 border border-kutumba-border rounded-lg focus:ring-2 focus:ring-kutumba-teal focus:border-kutumba-teal outline-none bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="px-4 py-3 border border-kutumba-border rounded-lg focus:ring-2 focus:ring-kutumba-teal focus:border-kutumba-teal outline-none bg-white"
                  />
                </div>

                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-kutumba-border rounded-lg focus:ring-2 focus:ring-kutumba-teal focus:border-kutumba-teal outline-none bg-white"
                />

                <button
                  onClick={handleContinue}
                  className="inline-flex items-center justify-center w-full bg-kutumba-maroon hover:bg-kutumba-maroon/90 text-white py-3 text-lg shadow-kutumba rounded-md"
                >
                  Continue
                </button>

                <p className="text-xs text-kutumba-muted text-center">
                  Already have an account?{" "}
                  <Link href="/login" className="text-kutumba-teal hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}