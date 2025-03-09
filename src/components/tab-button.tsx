import { Button } from "./ui/button";

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export default function TabButton({ icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <Button
      className={`flex items-center px-4 py-2 rounded-full transition-all ${
        isActive ? "bg-[#2D4A6D] text-white" : "bg-white text-[#2D4A6D] hover:bg-indigo-100"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="mr-2">{label}</span>
    </Button>
  );
}
