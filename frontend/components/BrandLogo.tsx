import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
  admin?: boolean;
  className?: string;
};

export default function BrandLogo({
  href = "/dashboard",
  compact = false,
  admin = false,
  className = "",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${
          compact ? "h-9 w-9" : "h-12 w-12"
        }`}
      >
        <Image
          src="/ry-logo.jpg"
          alt="RY MULTI SERVICE Logo"
          fill
          sizes={compact ? "36px" : "48px"}
          className="object-contain p-1"
          priority
        />
      </div>

      <div className="leading-tight">
        <p
          className={`font-black tracking-tight text-blue-700 ${
            compact ? "text-sm" : "text-base sm:text-lg"
          }`}
        >
          RY MULTI SERVICE
        </p>

        <p
          className={`mt-0.5 font-black uppercase tracking-[0.16em] ${
            admin ? "text-emerald-600" : "text-slate-500"
          } ${compact ? "text-[8px]" : "text-[9px]"}`}
        >
          {admin ? "Administration Panel" : "Digital Services Platform"}
        </p>
      </div>
    </Link>
  );
}