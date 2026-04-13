import { cn } from "@/lib/utils";

/** Logo en base64 (data URL) depuis Paramètres ; sinon fallback « OCP ». */
export function BrandingLogo({
  logoDataUrl,
  className,
  imgClassName,
}: {
  logoDataUrl?: string;
  className?: string;
  imgClassName?: string;
}) {
  if (logoDataUrl) {
    return (
      <img
        src={logoDataUrl}
        alt=""
        className={cn("shrink-0 rounded-lg object-contain object-center bg-muted/40", imgClassName, className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground",
        className,
      )}
    >
      OCP
    </div>
  );
}
