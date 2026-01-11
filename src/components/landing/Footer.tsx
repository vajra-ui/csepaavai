import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const quickLinks = [
  { name: 'About', href: '#about' },
  { name: 'Programs', href: '#programs' },
  { name: 'Faculty', href: '#faculty' },
  { name: 'Research', href: '#research' },
  { name: 'Events', href: '#events' },
  { name: 'Infrastructure', href: '#infrastructure' },
];

const portalLinks = [
  { name: 'Student Portal', href: '/login' },
  { name: 'Faculty Portal', href: '/login' },
  { name: 'Admin Portal', href: '/login' },
];

const socialLinks = [
  { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
  { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
  { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
  { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
];

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }}
      />

      <div className="container mx-auto px-4 relative">
        {/* Main Footer Content */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-accent">
                <GraduationCap className="h-7 w-7 text-accent-foreground" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">CSE Department</p>
                <p className="text-xs text-primary-foreground/70">Paavai Engineering College</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed mb-6">
              Shaping future technologists with excellence in education, 
              innovation, and industry-ready skills since 2001.
            </p>
            <p className="text-sm font-medium text-accent">
              "One Platform. Three Roles. One Future."
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Portals</h3>
            <ul className="space-y-3">
              {portalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-primary-foreground/80">
                  Paavai Engineering College,<br />
                  NH-44, Pachal, Namakkal - 637 018,<br />
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span className="text-sm text-primary-foreground/80">+91 4286 225599</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span className="text-sm text-primary-foreground/80">cse@pec.paavai.edu.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="py-6 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-primary-foreground/60 text-center">
            © {new Date().getFullYear()} Department of CSE, Paavai Engineering College. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
