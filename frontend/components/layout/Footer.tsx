import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold gym-text-gradient mb-4">IronPulse Gym</h3>
            <p className="text-muted-foreground">
              Transform your body, forge your strength
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/plans" className="hover:text-primary transition-colors">
                    Plans
                  </Link>
                </li>
                <li>
                  <Link href="/trainers" className="hover:text-primary transition-colors">
                    Trainers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <address className="space-y-2 text-muted-foreground not-italic">
              <p>Email: info@ironpulse.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Fitness St, Gym City</p>
            </address>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; 2026 IronPulse Gym. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
