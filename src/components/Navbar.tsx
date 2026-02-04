"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-kutumba-border bg-white/80 backdrop-blur animate-in fade-in duration-500">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
          <div className="h-10 w-10 rounded-lg overflow-hidden animate-in zoom-in duration-500">
            <Image
              src="/kutumba-tree-logo.jpg"
              alt="Kutumba Tree Logo"
              width={40}
              height={40}
              priority
            />
          </div>
          <h1 className="text-xl font-extrabold text-kutumba-dark-text animate-in slide-in-from-left duration-500 delay-100">
            <span className="text-kutumba-maroon">Kutumba</span> Tree
          </h1>
        </Link>

        <div className="hidden items-center gap-7 text-base font-semibold text-kutumba-dark-text md:flex">
          <Link className="transition-colors duration-300 hover:text-kutumba-maroon relative group" href="#features">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-kutumba-maroon transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link className="transition-colors duration-300 hover:text-kutumba-maroon relative group" href="#pricing">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-kutumba-maroon transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link className="transition-colors duration-300 hover:text-kutumba-maroon relative group" href="#about">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-kutumba-maroon transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex animate-in slide-in-from-right duration-500 delay-300">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  className="text-sm font-semibold text-kutumba-dark-text transition-colors duration-300 hover:text-kutumba-maroon"
                  href="/admin"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                className="rounded-md bg-kutumba-maroon px-4 py-2 text-sm font-semibold text-white shadow-kutumba transition-all duration-300 hover:bg-kutumba-maroon/90 hover:shadow-lg hover:scale-105 active:scale-95"
                href="/dashboard"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className="text-sm font-semibold text-kutumba-dark-text transition-colors duration-300 hover:text-kutumba-maroon" href="/login">
                Login
              </Link>
              <Link
                className="rounded-md bg-kutumba-maroon px-4 py-2 text-sm font-semibold text-white shadow-kutumba transition-all duration-300 hover:bg-kutumba-maroon/90 hover:shadow-lg hover:scale-105 active:scale-95"
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
          className="inline-flex items-center justify-center rounded-md border border-kutumba-border p-2 text-kutumba-dark-text transition-all duration-300 md:hidden hover:bg-kutumba-maroon/10"
        >
          <span className="sr-only">Toggle menu</span>
          <div className="space-y-1">
            <span className={`block h-0.5 w-5 bg-kutumba-dark-text transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block h-0.5 w-5 bg-kutumba-dark-text transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 w-5 bg-kutumba-dark-text transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {
        isOpen && (
          <div className="border-t border-kutumba-border bg-white md:hidden animate-in slide-in-from-top duration-300">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm font-semibold items-center text-center">
              <Link className="text-kutumba-dark-text transition-colors duration-300 hover:text-kutumba-maroon relative group" href="#features">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-kutumba-maroon transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link className="text-kutumba-dark-text transition-colors duration-300 hover:text-kutumba-maroon relative group" href="#pricing">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-kutumba-maroon transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link className="text-kutumba-dark-text transition-colors duration-300 hover:text-kutumba-maroon relative group" href="#about">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-kutumba-maroon transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <div className="flex w-full flex-col gap-2 pt-3">
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link
                        className="w-full rounded-md border border-kutumba-border px-4 py-3 text-sm font-semibold text-kutumba-dark-text transition-all duration-300 hover:text-kutumba-maroon hover:bg-kutumba-maroon/10"
                        href="/admin"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      className="w-full rounded-md bg-kutumba-maroon px-4 py-3 text-sm font-semibold text-white shadow-kutumba transition-all duration-300 hover:bg-kutumba-maroon/90 hover:shadow-lg hover:scale-105 active:scale-95"
                      href="/dashboard"
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      className="w-full rounded-md border border-kutumba-border px-4 py-3 text-sm font-semibold text-kutumba-dark-text transition-all duration-300 hover:text-kutumba-maroon hover:bg-kutumba-maroon/10"
                      href="/login"
                    >
                      Login
                    </Link>
                    <Link
                      className="w-full rounded-md bg-kutumba-maroon px-4 py-3 text-sm font-semibold text-white shadow-kutumba transition-all duration-300 hover:bg-kutumba-maroon/90 hover:shadow-lg hover:scale-105 active:scale-95"
                      href="/register"
                    >
                      Start Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      }
    </nav >
  );
}