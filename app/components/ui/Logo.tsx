import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = '', width = 26, height = 26 }: LogoProps) {
  return (
    <Image
      src="/saga-logo.svg"
      alt="SAGA Logo"
      width={width}
      height={height}
      className={`dark:invert ${className}`}
      priority
    />
  );
}
