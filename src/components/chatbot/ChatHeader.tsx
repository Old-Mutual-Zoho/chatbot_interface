import { IoChevronBack, IoClose } from "react-icons/io5";
import Logo from "../../assets/Logo.png";

type ChatHeaderProps = {
  title: string;
  onBack?: () => void;
  onClose: () => void;
};

export default function ChatHeader({ title, onBack, onClose }: ChatHeaderProps) {
  return (
    <div className="bg-primary text-white p-4 flex items-center gap-3 relative z-10">
      {/* Simple, consistent header used across the widget screens. */}
      {onBack ? (
        <button onClick={onBack} className="text-2xl cursor-pointer">
          <IoChevronBack />
        </button>
      ) : (
        // Keep title alignment consistent when back isn't available.
        <div className="w-6" />
      )}
      {/* Brand + assistant name + screen title */}
      <div className="flex items-center gap-2 flex-1">
        <img src={Logo} alt="Old Mutual" className="w-7 h-7 object-contain" />
        <span className="text-lg font-semibold">MIA</span>
        <span className="text-base font-normal ml-2">{title}</span>
      </div>
      {/* Close returns control to the host page */}
      <button onClick={onClose} className="text-2xl cursor-pointer">
        <IoClose />
      </button>
    </div>
  );
}
