import { IoChevronBack, IoClose } from "react-icons/io5";

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose: () => void;
}

export default function ChatHeader({
  title,
  subtitle,
  onBack,
  onClose,
}: ChatHeaderProps) {
  return (
    <div className="bg-primary text-white p-4 rounded-t-xl flex items-center gap-3">
      
      {/* BACK ICON (optional) */}
      {onBack ? (
        <button onClick={onBack} className="text-2xl">
          <IoChevronBack />
        </button>
      ) : (
        <div className="w-6" /> // empty placeholder for alignment
      )}

      {/* TITLE + SUBTITLE */}
      <div className="flex flex-col flex-1">
        <span className="text-lg font-semibold">{title}</span>
        {subtitle && <span className="text-sm opacity-90">{subtitle}</span>}
      </div>

      {/* CLOSE ICON */}
      {/* <button onClick={onClose} className="text-2xl">
        <IoClose />
      </button> */}
    </div>
  );
}
