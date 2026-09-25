import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  subtitle?: string;
  compact?: boolean;
};

export default function BrandLogo({
  href = "/dashboard",
  subtitle = "RY MULTI SERVICE",
  compact = false,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3"
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${
          compact
            ? "h-9 w-9"
            : "h-11 w-11"
        }`}
      >
        <Image
          src="/ry-logo.jpg"
          alt="RY Multi Service Logo"
          fill
          sizes={compact ? "36px" : "44px"}
          className="object-contain p-1"
          priority
        />
      </div>

      <div className="leading-tight">
        <p
          className={`font-black tracking-tight text-blue-700 ${
            compact
              ? "text-sm"
              : "text-base sm:text-lg"
          }`}
        >
          RY MULTI SERVICE
        </p>

        {subtitle && (
          <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}