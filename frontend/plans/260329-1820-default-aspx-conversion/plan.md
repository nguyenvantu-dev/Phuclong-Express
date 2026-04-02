---
title: "Convert Default.aspx to Next.js Public Home Page"
description: "Convert the ASPX public home page to Next.js App Router with hero slider, tracking lookup, services, testimonials, stats counters"
status: pending
priority: P2
effort: 8h
branch: ""
tags: [conversion, nextjs, public-page, home-page]
created: 2026-03-29
---

# Phase 1: Create Public Layout (Root Layout)
**Duration: 1.5h**

### Overview
The existing `layout.tsx` is a bare-bones shell. The current `admin/layout.tsx` uses an admin sidebar which is NOT suitable for public pages. Need to create a public layout with header navigation and footer.

### Implementation
1. Create `frontend/src/app/components/public-layout.tsx` - public layout wrapper with:
   - Header: logo + nav links (Services, About, Mission, Contact)
   - Footer: company info, social links, hotline
2. Update `frontend/src/app/layout.tsx` to use public layout

### Related Files
- Create: `frontend/src/app/components/public-layout.tsx`
- Modify: `frontend/src/app/layout.tsx`

---

# Phase 2: Create Hero/Intro Section with Slider
**Duration: 1h**

### Overview
The intro slider uses Slick carousel with 5 slides and a tracking lookup form. Replace Slick with Swiper.js (better React integration).

### Implementation
1. Install swiper: `npm install swiper`
2. Create `frontend/src/app/components/hero-section.tsx`
3. Implement Swiper carousel with 5 slides from `/image1/slide-1.jpg` through `/image1/slide-5.jpg`
4. Add prev/next arrow controls
5. CSS: use Tailwind utilities + custom `.intro` classes in `globals.css`

### Related Files
- Create: `frontend/src/app/components/hero-section.tsx`
- Modify: `frontend/src/app/globals.css`

---

# Phase 3: Create Tracking Lookup Form Component
**Duration: 1h**

### Overview
The `ucTraCuuTracking` user control performs tracking lookup. Need to create a React form that calls the existing tracking API endpoint.

### Implementation
1. Create `frontend/src/app/components/tracking-lookup-form.tsx`
2. Form: input field for tracking code + search button
3. Display results (status, timeline)
4. API: reuse existing tracking API or call backend endpoint
5. Style with `.request-form` classes

### Related Files
- Create: `frontend/src/app/components/tracking-lookup-form.tsx`

---

# Phase 4: Create Services Section
**Duration: 0.5h**

### Overview
Services section with Sứ mệnh and Tầm nhìn cards. Each has an image and text content.

### Implementation
1. Create `frontend/src/app/components/services-section.tsx`
2. Two cards: "Sứ mệnh" (Mission) and "Tầm nhìn" (Vision)
3. Images: `/image1/Sumenh.jpg`, `/image1/Tamnhin.jpg`
4. Add fade-in animations (CSS only, no AOS library needed)

### Related Files
- Create: `frontend/src/app/components/services-section.tsx`

---

# Phase 5: Create Product Categories Section
**Duration: 0.5h**

### Overview
9 product category cards in a responsive grid (3x3 or responsive). Use the same `.team__item` pattern from original.

### Implementation
1. Create `frontend/src/app/components/categories-section.tsx`
2. Grid layout: responsive (1 col mobile, 2 col tablet, 3 col desktop)
3. 9 categories: Fashion, Electronics, Tech, Supplements, Kids, Office, Jewelry, Auto parts, Cosmetics
4. Images from `/image1/service4.jpg` through `/image1/service12.jpg`

### Related Files
- Create: `frontend/src/app/components/categories-section.tsx`

---

# Phase 6: Create Clients & Reviews Section
**Duration: 0.75h**

### Overview
Client logos + review slider (Slick). Replace with Swiper.

### Implementation
1. Create `frontend/src/app/components/clients-section.tsx`
2. Logo area with single SVG logo from `/image1/1.svg`
3. Review carousel with 2 review cards using Swiper
4. Each review: logo, company name, review text

### Related Files
- Create: `frontend/src/app/components/clients-section.tsx`

---

# Phase 7: Create Statistics Counters Section
**Duration: 0.5h**

### Overview
4 animated counters: 1435 packages, 2675 orders, 4436 customers, 749 partners. Use Intersection Observer for scroll-triggered counting animation.

### Implementation
1. Create `frontend/src/app/components/stats-section.tsx`
2. 4 stats with icons (FontAwesome via `react-icons`)
3. Animated count-up on scroll into view
4. Icons: box, invoice, users, handshake

### Related Files
- Create: `frontend/src/app/components/stats-section.tsx`
- Install: `npm install react-icons`

---

# Phase 8: Create Testimonials Section
**Duration: 0.5h**

### Overview
3 customer testimonials in a grid with star ratings and quotes.

### Implementation
1. Create `frontend/src/app/components/testimonials-section.tsx`
2. 3-column grid on desktop
3. Each card: quote icon, text, star rating, avatar, name
4. Images: `/image1/user-1.png`, `/image1/user-2.png`, `/image1/user-3.png`

### Related Files
- Create: `frontend/src/app/components/testimonials-section.tsx`

---

# Phase 9: Create Benefits Section
**Duration: 0.5h**

### Overview
4 benefit items (Safety, Quality, Support, Security) + image. Two-column layout: list on left, image on right.

### Implementation
1. Create `frontend/src/app/components/benefits-section.tsx`
2. Left: 4 benefit items with icons
3. Right: image `/image1/2.jpg`

### Related Files
- Create: `frontend/src/app/components/benefits-section.tsx`

---

# Phase 10: Create Team/About Section
**Duration: 0.5h**

### Overview
Company story text + CSKH contact card with email and phone.

### Implementation
1. Create `frontend/src/app/components/about-section.tsx`
2. Company story paragraphs
3. CSKH card with photo `/image1/cskh1.jpg` and contact info

### Related Files
- Create: `frontend/src/app/components/about-section.tsx`

---

# Phase 11: Create Mission Section
**Duration: 0.5h**

### Overview
Mission section with a simple image carousel (3 images) and 4 mission statements.

### Implementation
1. Create `frontend/src/app/components/mission-section.tsx`
2. Simple auto-play carousel with 3 images
3. 4 mission statement items

### Related Files
- Create: `frontend/src/app/components/mission-section.tsx`

---

# Phase 12: Update Root Page (page.tsx)
**Duration: 0.5h**

### Overview
Assemble all sections into the root page.tsx with proper section IDs for navigation.

### Implementation
1. Update `frontend/src/app/page.tsx`
2. Import and compose all section components
3. Add Tawk.to chat widget script
4. Import public layout
5. Section order: Hero, Services, Categories, Clients/Stats, Testimonials, Benefits, About, Mission

### Related Files
- Modify: `frontend/src/app/page.tsx`

---

# Phase 13: Global CSS & Styles
**Duration: 1h**

### Overview
Add all necessary CSS classes and Tailwind configuration for the public page.

### Implementation
1. Update `frontend/src/app/globals.css` with:
   - `.intro` section styles (slider, inner, text, arrows)
   - `.services` section styles
   - `.team` grid styles
   - `.clients` styles
   - `.stats` counter styles
   - `.testimonial` card styles
   - `.benefits` two-column layout
   - `.vechungtoi` about section
   - `.mission` carousel styles
   - `.request-form` tracking form styles
2. Tailwind config updates if needed

### Related Files
- Modify: `frontend/src/app/globals.css`

---

# Phase 14: Test & Verify
**Duration: 1h**

### Overview
Verify all sections render correctly, test animations, verify responsive behavior.

### Implementation
1. Run `npm run dev` and check all sections
2. Test slider navigation
3. Test tracking lookup form
4. Test statistics counter animation
5. Verify responsive layout (mobile, tablet, desktop)
6. Check all images load correctly

---

## Component Architecture

```
frontend/src/app/
├── layout.tsx                          # Root layout (updated)
├── page.tsx                            # Home page (updated)
├── globals.css                         # Global styles (updated)
└── components/
    ├── public-layout.tsx               # NEW: Public header/footer
    ├── hero-section.tsx                # NEW: Intro slider + tracking form
    ├── services-section.tsx            # NEW: Mission & Vision
    ├── categories-section.tsx          # NEW: 9 product categories
    ├── clients-section.tsx             # NEW: Logos + reviews
    ├── stats-section.tsx                # NEW: Animated counters
    ├── testimonials-section.tsx        # NEW: 3 customer reviews
    ├── benefits-section.tsx             # NEW: 4 benefits + image
    ├── about-section.tsx                # NEW: Company story + CSKH
    └── mission-section.tsx              # NEW: Mission carousel
```

## Dependencies
- `swiper` - for carousels (replaces Slick, Owl Carousel)
- `react-icons` - for icons (replaces FontAwesome)

## Unresolved Questions
1. **Tracking API**: Confirm the exact endpoint for tracking lookup - is it `GET /api/tracking/{code}` or different?
2. **Images**: Are all images from `/image1/` and `/images/` directories being migrated to `public/` folder?
3. **Tawk.to**: Keep the same widget ID or create a new one for the new site?
4. **Responsive behavior**: Are there specific breakpoints the original site uses that should be preserved?
5. **Fonts**: Any specific Google Fonts used in the original that should be kept?

## Success Criteria
- All 10 sections render correctly
- Hero slider works with auto-play and manual controls
- Tracking lookup form submits and shows results
- Statistics counters animate on scroll
- All images display correctly
- Fully responsive (mobile, tablet, desktop)
- No console errors
- Build passes without errors