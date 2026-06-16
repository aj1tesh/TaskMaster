interface UserAvatarProps {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserAvatar({ name, src, size = 32, className = "" }: UserAvatarProps) {
  const dimension = `${size}px`;
  const shared = `rounded bg-raised object-cover ${className}`;

  if (src) {
    if (src.startsWith("http")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || "Profile"}
          width={size}
          height={size}
          className={shared}
          referrerPolicy="no-referrer"
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name || "Profile"} width={size} height={size} className={shared} />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded bg-raised font-mono text-xs text-text-muted ${className}`}
      style={{ width: dimension, height: dimension }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
