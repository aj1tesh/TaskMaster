interface ProjectDotProps {
  colorHex: string;
  size?: number;
}

export function ProjectDot({ colorHex, size = 8 }: ProjectDotProps) {
  return (
    <span
      className="inline-block shrink-0 rounded-sm"
      style={{ backgroundColor: colorHex, width: size, height: size }}
    />
  );
}
