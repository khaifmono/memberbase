export function MaskedIC({ ic, visible = false }: { ic: string; visible?: boolean }) {
  if (visible) return <span className="font-mono text-sm">{ic}</span>;
  
  // Assuming IC format: 900101-14-5678 or 900101145678
  // Mask the first 8 characters
  const masked = ic.length > 4 
    ? "•".repeat(Math.max(0, ic.length - 4)) + ic.slice(-4)
    : ic;

  return (
    <span className="font-mono text-sm text-muted-foreground tracking-widest">
      {masked}
    </span>
  );
}
