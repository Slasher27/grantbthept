// Primary navigation — single source of truth, shared by the header and footer.
// Home-page section anchors are absolute (`/#id`) so they resolve from any page
// and preserve the live anchors (#about-me, #services, #contact — specs/02, 07).
export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about-me' },
  { label: 'Services', href: '/#services' },
  { label: 'Latest News', href: '/news/' },
  { label: 'Testimonials', href: '/testimonials/' },
];

export const contactCta = { label: 'Contact Me', href: '/#contact' };
