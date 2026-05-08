import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Dream. Plan. Achieve. The premium life & financial micro-planning OS by NS International.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="font-display text-gold mb-3">Leadership</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>Nageshwar Shukla — CEO & Founder</li>
            <li>Chirag Sir</li>
            <li>Ashish Sir · Harshit Sir</li>
            <li>Vivek Chauhan</li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-display text-gold mb-3">Built with vision</h4>
          <p className="text-muted-foreground">Crafted by Vivek Chauhan for the NSI family.</p>
          <p className="text-muted-foreground mt-2">Ahmedabad · Gujarat · India</p>
        </div>
      </div>
      <div className="gold-divider" />
      <div className="text-center text-xs text-muted-foreground py-5">
        © {new Date().getFullYear()} NS International. All rights reserved.
      </div>
    </footer>
  );
}
