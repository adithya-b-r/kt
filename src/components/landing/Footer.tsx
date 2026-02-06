"use client"

import Link from "next/link";
import Image from "next/image";
import { Globe, Mail, Phone, TreePine } from "lucide-react";

const footerSections = {
  tools: {
    title: "Family Tools",
    links: [
      "Family Tree Builder",
      "Cultural Integration",
      "Name Search",
      "PDF Exports",
      "WhatsApp Sharing",
      "Multi-Language Support",
    ],
  },
  features: {
    title: "Features",
    links: [
      "Free 75 Members",
      "Cultural Festivals",
      "Indian States Coverage",
      "Photo Storage",
      "Family Sharing",
      "Mobile App",
    ],
  },
  support: {
    title: "Support",
    links: ["Help Center", "Getting Started", "Video Tutorials", "FAQ", "Contact Us", "Account Help"],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", url: "#about" },
      { label: "Pricing", url: "#pricing" },
      { label: "Privacy Policy", url: "#" },
      { label: "Terms of Service", url: "#" },
      { label: "Security", url: "#" },
      { label: "Contact", url: "#" },
    ],
  },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-kutumba-light-teal/10 border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg overflow-hidden">
                <Image
                  src="/kutumba-tree-logo.png"
                  alt="Kutumba Tree Logo"
                  width={40}
                  height={40}
                  priority
                />
              </div>
              <span className="text-xl font-bold">KutumbaTree</span>
            </div>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Build your Indian family tree with cultural traditions and connect with relatives across India&apos;s 28
              states and union territories.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-lg" title="India">
                🇮🇳
              </span>
              <span className="text-sm text-muted-foreground">28 States & UTs Covered</span>
            </div>
          </div>

          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => {
                  const isLinkObject = typeof link === "object";
                  const linkLabel = isLinkObject ? link.label : link;
                  const linkUrl = isLinkObject ? link.url : "#";
                  const isInternalLink = linkUrl.startsWith("/") || linkUrl.startsWith("#");

                  return (
                    <li key={linkLabel}>
                      {isInternalLink ? (
                        <Link
                          href={linkUrl}
                          className="text-muted-foreground hover:text-kutumba-maroon transition-colors text-sm"
                        >
                          {linkLabel}
                        </Link>
                      ) : (
                        <a
                          href={linkUrl}
                          className="text-muted-foreground hover:text-kutumba-maroon transition-colors text-sm"
                        >
                          {linkLabel}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 py-8 border-t border-border">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-kutumba-teal" />
              Email Support
            </h4>
            <p className="text-sm text-muted-foreground mb-2">General inquiries:</p>
            <a
              href="mailto:hello@kutumbatree.com"
              className="text-kutumba-maroon hover:text-kutumba-gold transition-colors"
            >
              hello@kutumbatree.com
            </a>
            <p className="text-sm text-muted-foreground mb-1 mt-3">Technical support:</p>
            <a
              href="mailto:support@kutumbatree.com"
              className="text-kutumba-maroon hover:text-kutumba-gold transition-colors"
            >
              support@kutumbatree.com
            </a>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4 text-kutumba-teal" />
              Support Hours
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Monday - Friday:</span>
                <span className="ml-2">9 AM - 6 PM IST</span>
              </div>
              <div>
                <span className="text-muted-foreground">Saturday:</span>
                <span className="ml-2">10 AM - 4 PM IST</span>
              </div>
              <p className="text-muted-foreground mt-3">Response time: Within 24 hours</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-kutumba-teal" />
              Available Languages
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">English</span>
              <span className="text-muted-foreground">हिंदी</span>
              <span className="text-muted-foreground">ગુજરાતી</span>
              <span className="text-muted-foreground">தமிழ்</span>
              <span className="text-muted-foreground">বাংলা</span>
              <span className="text-muted-foreground">ಕನ್ನಡ</span>
              <span className="text-muted-foreground">മലയാളം</span>
              <span className="text-muted-foreground">मराठी</span>
              <span className="text-muted-foreground">తెలుగు</span>
              <span className="text-muted-foreground">कोंकणी</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4 mb-4 md:mb-0">
            <span>© {currentYear} KutumbaTree. All rights reserved.</span>
            <span>•</span>
            <a href="#" className="hover:text-kutumba-maroon transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-kutumba-maroon transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="#" className="hover:text-kutumba-maroon transition-colors">
              Security
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span>Built for Indian families</span>
            <div className="flex items-center gap-2 px-2 py-1 bg-accent rounded">
              <div className="w-2 h-2 bg-kutumba-green rounded-full"></div>
              <span className="text-xs font-medium">🇮🇳 India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}