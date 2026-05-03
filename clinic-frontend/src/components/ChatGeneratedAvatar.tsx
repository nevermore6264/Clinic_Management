"use client";

import { useState } from "react";
import {
  chatAvatarDicebearUrl,
  chatAvatarInitials,
} from "@/lib/chatAvatarDicebear";

type Props = {
  userId: number;
  hoTen?: string;
  tenDangNhap?: string;
  className: string;
};

/**
 * Avatar minh họa (DiceBear notionists). Nếu không tải được ảnh thì hiện 2 chữ cái như trước.
 */
export function ChatGeneratedAvatar({
  userId,
  hoTen,
  tenDangNhap,
  className,
}: Props) {
  const hint = (tenDangNhap ?? hoTen ?? "").trim();
  const src = chatAvatarDicebearUrl(userId, hint);
  const initials = chatAvatarInitials(hoTen, tenDangNhap);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={className}>{initials}</span>;
  }

  return (
    <span className={`${className} chat-dm-app__avatar--gen`}>
      <img
        src={src}
        alt=""
        width={64}
        height={64}
        decoding="async"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
