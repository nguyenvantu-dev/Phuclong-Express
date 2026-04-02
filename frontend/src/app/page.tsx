import PublicLayout from './components/public-home/public-layout';
import HeroSection from './components/public-home/hero-section';
import ServicesSection from './components/public-home/services-section';
import CategoriesSection from './components/public-home/categories-section';
import ClientsSection from './components/public-home/clients-section';
import StatsSection from './components/public-home/stats-section';
import TestimonialsSection from './components/public-home/testimonials-section';
import BenefitsSection from './components/public-home/benefits-section';
import AboutSection from './components/public-home/about-section';
import MissionSection from './components/public-home/mission-section';

/**
 * Public Home Page
 *
 * This is the default page for Phuc Long Express website.
 * Converted from Default.aspx (ASP.NET WebForms) to Next.js App Router.
 *
 * Structure follows the original ASPX page sections:
 * 1. Hero/Intro with slider + tracking lookup
 * 2. Services (Sứ mệnh, Tầm nhìn)
 * 3. Categories (9 product categories)
 * 4. Clients & Stats
 * 5. Testimonials
 * 6. Benefits
 * 7. About/Team
 * 8. Mission
 */
export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section with Intro Slider + Tracking Lookup */}
      <HeroSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Clients Section + Stats */}
      <ClientsSection />

      {/* Stats Section inside wrapper */}
      <div className="conteiner">
        <StatsSection />
      </div>

      {/* Testimonials Section */}
      <div className="py-12 bg-gray-50">
        <TestimonialsSection />
      </div>

      {/* Benefits Section */}
      <BenefitsSection />

      {/* About Section */}
      <AboutSection />

      {/* Mission Section */}
      <MissionSection />

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