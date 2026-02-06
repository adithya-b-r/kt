import Link from "next/link";
import { Check, Star } from "lucide-react";

const currencies = {
  INR: { symbol: "₹", name: "INR (India)" },
};

const plans = {
  free: {
    name: "Heritage Starter",
    description: "Perfect for individuals starting their family history journey",
    prices: { INR: 0 },
    features: [
      "75 family members maximum",
      "Text-only family profiles",
      "Limited family tree export",
      "Watermarked PDF downloads",
      "Mobile app access",
      "Multi-language interface",
      "Basic Indian name search",
      "Cultural festival calendar",
    ],
    popular: false,
    isFree: true,
  },
  premium: {
    name: "Heritage Explorer",
    description: "Complete family heritage platform for serious researchers",
    prices: { INR: 999 },
    features: [
      "Everything in Heritage Starter",
      "Unlimited family members",
      "Full profiles with photos & stories",
      "WhatsApp family tree sharing",
      "Advanced cultural integration",
      "Unlimited photo storage (50GB)",
      "Premium PDF exports (no watermark)",
      "Family sharing (up to 5 members)",
      "Priority customer support",
      "Enhanced search capabilities",
    ],
    popular: true,
    isFree: false,
  },
};

const paymentMethods = {
  INR: ["UPI", "Credit/Debit Card", "Net Banking", "Paytm", "PhonePe", "Google Pay"],
};

export default function PricingSection() {
  const selectedCurrency: keyof typeof currencies = "INR";

  return (
    <section id="pricing" className="py-20 bg-kutumba-light-teal/20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-kutumba-dark-text">Choose Your</span>
            <br />
            <span className="text-kutumba-maroon">Heritage Journey</span>
          </h2>
          <p className="text-xl text-kutumba-muted max-w-3xl mx-auto mb-8">
            Affordable pricing designed for Indian families, with trusted local payment options
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className={`relative border-2 transition-all duration-300 rounded-2xl bg-card p-6 md:p-8 ${plan.popular
                ? "border-kutumba-maroon shadow-kutumba scale-105"
                : "border-kutumba-border hover:border-kutumba-teal/20"
                }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-kutumba-maroon text-white px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </span>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-base text-kutumba-muted mb-4">{plan.description}</p>
                <div className="text-4xl font-bold text-primary">
                  {plan.isFree ? (
                    <>
                      <span className="text-kutumba-green">Free</span>
                      <span className="text-lg text-kutumba-muted font-normal"> Forever</span>
                    </>
                  ) : (
                    <>
                      <span className="blur-sm select-none">{currencies[selectedCurrency].symbol}
                        {plan.prices[selectedCurrency]}</span>
                      <span className="text-lg text-kutumba-muted font-normal">/month</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-6 mt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-kutumba-teal shrink-0 mt-0.5" />
                      <span className={`text-sm ${(plan.popular && index > 1) || (plan.isFree && index > 5) ? "blur-sm select-none" : ""}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.isFree ? "/register" : "/register?plan=premium"}
                  className={`inline-flex items-center justify-center w-full rounded-md px-4 py-2 font-medium transition-colors ${plan.popular
                    ? "bg-kutumba-maroon hover:bg-kutumba-maroon/90 shadow-kutumba text-white"
                    : plan.isFree
                      ? "bg-kutumba-green hover:bg-kutumba-green/90 text-white"
                      : "border border-kutumba-border text-kutumba-dark-text hover:bg-kutumba-light-teal/20"
                    }`}
                >
                  {plan.isFree ? "Start Free Family Tree" : "Start 7-Day Free Trial"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-8 border-2 border-kutumba-border mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">What&apos;s Included</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="blur-xs select-none">
              <h4 className="font-semibold mb-4 text-kutumba-gold">Cultural Features</h4>
              <ul className="space-y-2 text-sm text-kutumba-muted">
                <li>• Cultural festival calendar</li>
                <li>• Multi-language interface</li>
                <li>• Indian naming systems</li>
                <li>• Regional customization</li>
                <li>• Traditional elements</li>
              </ul>
            </div>
            <div className="blur-xs select-none">
              <h4 className="font-semibold mb-4 text-kutumba-maroon">Family Tools</h4>
              <ul className="space-y-2 text-sm text-kutumba-muted">
                <li>• Interactive family tree builder</li>
                <li>• Basic name search (Free)</li>
                <li>• Enhanced search (Premium)</li>
                <li>• Photo storage (Premium)</li>
                <li>• Family sharing (Premium)</li>
              </ul>
            </div>
            <div className="blur-xs select-none">
              <h4 className="font-semibold mb-4 text-kutumba-teal">Premium Benefits</h4>
              <ul className="space-y-2 text-sm text-kutumba-muted">
                <li>• WhatsApp sharing</li>
                <li>• Unlimited members</li>
                <li>• Premium PDF exports</li>
                <li>• 50GB photo storage</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Accepted Payment Methods</h3>
          <p className="text-kutumba-muted mb-4">
            We support popular regional payment options for your convenience
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {paymentMethods[selectedCurrency].map((method) => (
              <span key={method} className="px-3 py-1 rounded-full border border-kutumba-border text-sm">
                {method}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <p className="text-sm text-kutumba-muted">
              ✓ 30-day free trial • ✓ Cancel anytime • ✓ Data export guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}