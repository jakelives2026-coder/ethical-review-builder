import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Review Builder Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy">
              <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                Privacy Policy
              </span>
            </Link>
            <Link href="/terms">
              <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                Terms of Service
              </span>
            </Link>
            <Link href="/contact">
              <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                Contact
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
