"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-kutumba-border bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg overflow-hidden">
            <Image
              src="/kutumba-tree-logo.png"
              alt="Kutumba Tree Logo"
              width={40}
              height={40}
              priority
              unoptimized
            />
          </div>
          <h1 className="text-xl font-extrabold text-kutumba-dark-text">
            <span className="text-kutumba-maroon">Kutumba</span> Tree
          </h1>
        </Link>

        <div className="hidden items-center gap-7 text-base font-semibold text-kutumba-dark-text md:flex">
          <Link className="hover:text-kutumba-maroon" href="#features">
            Features
          </Link>
          <Link className="hover:text-kutumba-maroon" href="#pricing">
            Pricing
          </Link>
          <Link className="hover:text-kutumba-maroon" href="#about">
            About
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                className="rounded-md bg-kutumba-maroon px-4 py-2 text-sm font-semibold text-white shadow-kutumba hover:bg-kutumba-maroon/90"
                href="/dashboard"
              >
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  className="rounded-md border border-kutumba-maroon px-4 py-2 text-sm font-semibold text-kutumba-maroon hover:bg-kutumba-maroon/5"
                  href="/admin"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          ) : (
            <>
              <Link className="text-sm font-semibold text-kutumba-dark-text hover:text-kutumba-maroon" href="/login">
                Login
              </Link>
              <Link
                className="rounded-md bg-kutumba-maroon px-4 py-2 text-sm font-semibold text-white shadow-kutumba hover:bg-kutumba-maroon/90"
                href="/register"
              >
                Start Free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-kutumba-border p-2 text-kutumba-dark-text md:hidden"
        >
          <span className="sr-only">Toggle menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-5 bg-kutumba-dark-text"></span>
            <span className="block h-0.5 w-5 bg-kutumba-dark-text"></span>
            <span className="block h-0.5 w-5 bg-kutumba-dark-text"></span>
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-kutumba-border bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm font-semibold items-center text-center">
            <Link className="text-kutumba-dark-text hover:text-kutumba-maroon" href="#features">
              Features
            </Link>
            <Link className="text-kutumba-dark-text hover:text-kutumba-maroon" href="#pricing">
              Pricing
            </Link>
            <Link className="text-kutumba-dark-text hover:text-kutumba-maroon" href="#about">
              About
            </Link>
            <div className="flex w-full flex-col gap-2 pt-3">
              {user ? (
                <>
                  <Link
                    className="w-full rounded-md bg-kutumba-maroon px-4 py-3 text-sm font-semibold text-white shadow-kutumba hover:bg-kutumba-maroon/90"
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      className="w-full rounded-md border border-kutumba-maroon px-4 py-3 text-sm font-semibold text-kutumba-maroon hover:bg-kutumba-maroon/5 bg-white text-center"
                      href="/admin"
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    className="w-full rounded-md border border-kutumba-border px-4 py-3 text-sm font-semibold text-kutumba-dark-text hover:text-kutumba-maroon"
                    href="/login"
                  >
                    Login
                  </Link>
                  <Link
                    className="w-full rounded-md bg-kutumba-maroon px-4 py-3 text-sm font-semibold text-white shadow-kutumba hover:bg-kutumba-maroon/90"
                    href="/register"
                  >
                    Start Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}