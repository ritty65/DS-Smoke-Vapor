import React, { useMemo, useState } from 'react';

const DEFAULT_FALLBACK_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1f1f1f" />
        <stop offset="100%" stop-color="#0a0a0a" />
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8b5cf6" />
        <stop offset="100%" stop-color="#22c55e" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#bg)" />
    <circle cx="640" cy="120" r="140" fill="url(#accent)" opacity="0.2" />
    <circle cx="140" cy="480" r="180" fill="url(#accent)" opacity="0.15" />
    <rect x="120" y="170" width="560" height="260" rx="28" fill="#111" stroke="#2d2d2d" />
    <text x="400" y="300" text-anchor="middle" font-size="44" font-family="'Arial Black', Arial, sans-serif" fill="#f8fafc" letter-spacing="6">DS SMOKE</text>
    <text x="400" y="350" text-anchor="middle" font-size="18" font-family="Arial, sans-serif" fill="#94a3b8" letter-spacing="3">PRODUCT IMAGE</text>
  </svg>`
)}`;

const isLocalAsset = (src?: string) => Boolean(src && (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')));

export type ProductImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string;
  fallbackSrc?: string;
  fallbackAlt?: string;
};

export const ProductImage = ({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  fallbackAlt = 'DS Smoke product image placeholder',
  loading = 'lazy',
  decoding = 'async',
  sizes,
  srcSet,
  onError,
  width,
  ...rest
}: ProductImageProps) => {
  const [hasError, setHasError] = useState(!src);
  const shouldUseLocal = useMemo(() => isLocalAsset(src), [src]);

  const resolvedSrc = !hasError && src ? src : fallbackSrc;
  const resolvedAlt = !hasError && src ? alt : fallbackAlt || alt;
  const resolvedSrcSet = shouldUseLocal
    ? srcSet || (src && width ? `${src} ${width}w` : undefined)
    : srcSet;
  const resolvedSizes = shouldUseLocal ? sizes : undefined;

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
    }
    onError?.(event);
  };

  return (
    <img
      src={resolvedSrc}
      alt={resolvedAlt}
      loading={loading}
      decoding={decoding}
      sizes={resolvedSizes}
      srcSet={resolvedSrcSet}
      width={width}
      onError={handleError}
      {...rest}
    />
  );
};
