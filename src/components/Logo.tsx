import logo from "@/assets/nsi-logo.jpg";

export function Logo({ size = 40, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="rounded-full ring-gold overflow-hidden bg-white"
        style={{ width: size, height: size }}
      >
        <img src={logo} alt="NSI logo" className="w-full h-full object-cover" />
      </div>
      {withText && (
        <div className="leading-tight">
          <div className="font-display text-xl tracking-wide text-gradient-gold">NSI</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            NS International
          </div>
        </div>
      )}
    </div>
  );
}
