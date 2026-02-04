"use client";

import { useState } from "react";

type MenuImageProps = {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string;
};

export default function MenuImage({
  src,
  alt,
  className,
  fallback = "🍞",
}: MenuImageProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div className={className} aria-label={alt} role="img">
        {fallback}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
