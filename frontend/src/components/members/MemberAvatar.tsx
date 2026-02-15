"use client";

import { useState } from "react";
import Image from "next/image";

interface MemberAvatarProps {
  name: string;
  photoUrl: string;
  size: number;
  bgColor: string;
  textColor?: string;
  className?: string;
}

export default function MemberAvatar({
  name,
  photoUrl,
  size,
  bgColor,
  textColor = "#ffffff",
  className = "",
}: MemberAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = name.slice(0, 1);
  const showImage = photoUrl && !imgError;

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: showImage ? undefined : bgColor,
      }}
    >
      {showImage ? (
        <Image
          src={photoUrl}
          alt={`${name} 프로필`}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-bold"
          style={{ color: textColor, fontSize: size * 0.375 }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
