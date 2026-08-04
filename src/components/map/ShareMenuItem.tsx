import { Button } from "../ui/button";

interface ShareMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export default function ShareMenuItem({
  icon,
  label,
  onClick,
}: ShareMenuItemProps) {
  return (
    <Button
        variant="outline"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}