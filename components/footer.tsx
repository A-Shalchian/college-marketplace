import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-card border-t border-gray-100 dark:border-border py-10">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h4 className="font-bold text-lg mb-4 text-primary">GBC Marketplace</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The official student-led marketplace for George Brown College. Shop safely, save money, and support your fellow students.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Community</h4>
          <ul className="space-y-3">
            <li>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Safety Guidelines
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Exchange Zones
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Support</h4>
          <ul className="space-y-3">
            <li>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Help Centre
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Report a Listing
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                Contact Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-6 mt-10 pt-6 border-t border-gray-100 dark:border-border text-center">
        <p className="text-xs text-muted-foreground">© 2026 GBC Student Marketplace. Built for students, by students.</p>
      </div>
    </footer>
  );
}
