import PublicLayout from './components/public-home/public-layout';
import HeroSection from './components/public-home/hero-section';
import ServicesSection from './components/public-home/services-section';
import CategoriesSection from './components/public-home/categories-section';
import ClientsSection from './components/public-home/clients-section';
import StatsSection from './components/public-home/stats-section';
import TestimonialsSection from './components/public-home/testimonials-section';
import HowItWorksSection from './components/public-home/how-it-works-section';
import AboutSection from './components/public-home/about-section';
import CtaSection from './components/public-home/cta-section';

/**
 * Public Home Page — Phuc Long Express
 *
 * Section order:
 * 1. Hero — slider + tracking lookup
 * 2. Why PLE — 3 key benefits + company description
 * 3. Countries — markets we ship from
 * 4. Stats — animated counters
 * 5. Brands — marquee of popular brands
 * 6. Testimonials — customer reviews
 * 7. About — company story + 4 features + contact
 */
export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section with Intro Slider + Tracking Lookup */}
      <HeroSection />

      {/* Why PLE Section */}
      <ServicesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Countries Section */}
      <CategoriesSection />

      {/* Clients Section */}
      <ClientsSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* About Section */}
      <AboutSection />

      {/* Final CTA Section */}
      <CtaSection />

      {/* Tawk.to Chat Widget */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"), s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/5e3bd988a89cda5a1884743c/default';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `,
        }}
      />
    </PublicLayout>
  );
}
