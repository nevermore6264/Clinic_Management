"use client";

import {
  chatAvatarGradientCss,
  chatAvatarInitials,
} from "@/lib/chatAvatar";

type Props = {
  userId: number;
  hoTen?: string;
  tenDangNhap?: string;
  className: string;
};

export function ChatGeneratedAvatar({
  userId,
  hoTen,
  tenDangNhap,
  className,
}: Props) {
  const initials = chatAvatarInitials(hoTen, tenDangNhap);
  const bg = chatAvatarGradientCss(userId);

  return (
    <span
      className={`${className} chat-dm-app__avatar--initials`}
      style={{ background: bg }}
      aria-hidden
      title={hoTen?.trim() || tenDangNhap || undefined}
    >
      {initials}
    </span>
  );
}
