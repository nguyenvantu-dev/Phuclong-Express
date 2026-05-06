import dynamic from 'next/dynamic';
import PublicLayout from './components/public-home/public-layout';
import HeroSection from './components/public-home/hero-section';
import ServicesSection from './components/public-home/services-section';
import HowItWorksSection from './components/public-home/how-it-works-section';

// Below-fold: lazy load to reduce initial bundle
const CategoriesSection  = dynamic(() => import('./components/public-home/categories-section'));
const WarehousesSection  = dynamic(() => import('./components/public-home/warehouses-section'));
const ClientsSection     = dynamic(() => import('./components/public-home/clients-section'));
const StatsSection       = dynamic(() => import('./components/public-home/stats-section'));
const TestimonialsSection = dynamic(() => import('./components/public-home/testimonials-section'));
const AboutSection       = dynamic(() => import('./components/public-home/about-section'));
const CtaSection         = dynamic(() => import('./components/public-home/cta-section'));

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

      {/* Warehouses Section */}
      <WarehousesSection />

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

    </PublicLayout>
  );
}
