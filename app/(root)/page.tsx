import { ReactLenis } from 'lenis/react'
import { Navbar }      from "./_sections/navbar";
import { Hero }        from "./_sections/hero";
import { Features }    from "./_sections/features";
import { HowItWorks }  from "./_sections/how-it-works";
import { Pricing }     from "./_sections/pricing";
import { FAQ }         from "./_sections/faq";
import { CTA }         from "./_sections/cta";
import { Footer }      from "./_sections/footer";

export default function LandingPage() {
  return (
    <main style={{ overflowX: "hidden" }}>
      <ReactLenis root />
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}