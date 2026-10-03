import React from "react";

/** Generic Unsplash/placeholder fallbacks per image role (offline-safe) */
export const IMG_FALLBACKS: Record<string, string> = {
  banner:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&q=60",
  cover:
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=60",
  logo:
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&q=60",
  screenshot:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&q=60",
  generic:
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc1?w=1280&q=60",
};

function roleForClass(className: string): string {
  if (/banner|hero/i.test(className)) return "banner";
  if (/logo/i.test(className)) return "logo";
  if (/screenshot|thumb/i.test(className)) return "screenshot";
  if (/cover|card/i.test(className)) return "cover";
  return "generic";
}

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  /** Explicit fallback URL; defaults to role-based Unsplash fallback */
  fallbackUrl?: string;
  draggable?: boolean;
}

/**
 * <img> wrapper that swaps in a fallback when the network image fails
 * (Steam CDN / Unsplash down), so the app never renders broken banners,
 * covers or logos — part of the "fallback URL" hardening (sec. 5).
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  fallbackUrl,
  draggable = false,
}) => {
  const fallback = fallbackUrl ?? IMG_FALLBACKS[roleForClass(className ?? "")];
  const [srcToUse, setSrcToUse] = React.useState<string>(src);

  // Reset back to the real src when it changes (e.g. game switch)
  React.useEffect(() => {
    setSrcToUse(src);
  }, [src]);

  const onError = () => {
    if (srcToUse !== fallback) setSrcToUse(fallback);
  };

  return (
    <img
      src={srcToUse}
      alt={alt}
      className={className}
      onError={onError}
      draggable={draggable}
      loading="lazy"
    />
  );
};

export default ImageWithFallback;