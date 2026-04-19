import { cn } from "@/lib/utils";
import commohedgeLogo from "@/assets/commohedge-logo.png";

/** Logo en base64 (data URL) depuis Paramètres ; sinon fallback logo Commohedge. */
export function BrandingLogo({
  logoDataUrl,
  className,
  imgClassName,
}: {
  logoDataUrl?: string;
  className?: string;
  imgClassName?: string;
}) {
  const src = logoDataUrl || commohedgeLogo;
  return (
    <img
      src={src}
      alt=""
      className={cn("shrink-0 rounded-lg object-contain object-center bg-muted/40", imgClassName, className)}
    />
  );
}
