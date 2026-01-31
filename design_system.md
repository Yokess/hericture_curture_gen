## Design System: HeritageCulture

### Pattern
- **Name:** Community/Forum Landing
- **Conversion Focus:** Show active community (member count, posts today). Highlight benefits. Preview content. Easy onboarding.
- **CTA Placement:** Join button prominent + After member showcase
- **Color Strategy:** Warm, welcoming. Member photos add humanity. Topic badges in brand colors. Activity indicators green.
- **Sections:** 1. Hero (community value prop), 2. Popular topics/categories, 3. Active members showcase, 4. Join CTA

### Style
- **Name:** Flat Design
- **Keywords:** 2D, minimalist, bold colors, no shadows, clean lines, simple shapes, typography-focused, modern, icon-heavy
- **Best For:** Web apps, mobile apps, cross-platform, startup MVPs, user-friendly, SaaS, dashboards, corporate
- **Performance:** 鈿?Excellent | **Accessibility:** 鉁?WCAG AAA

### Colors
| Role | Hex |
|------|-----|
| Primary | #7C3AED |
| Secondary | #A78BFA |
| CTA | #F97316 |
| Background | #FAF5FF |
| Text | #4C1D95 |

*Notes: Community brand colors + Engagement accents*

### Typography
- **Heading:** Archivo
- **Body:** Space Grotesk
- **Mood:** minimal, portfolio, designer, creative, clean, artistic
- **Best For:** Design portfolios, creative professionals, minimalist brands
- **Google Fonts:** https://fonts.google.com/share?selection.family=Archivo:wght@300;400;500;600;700|Space+Grotesk:wght@300;400;500;600;700
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
```

### Key Effects
No gradients/shadows, simple hover (color/opacity shift), fast loading, clean transitions (150-200ms ease), minimal icons

### Avoid (Anti-patterns)
- Poor profiles
- No reviews

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

