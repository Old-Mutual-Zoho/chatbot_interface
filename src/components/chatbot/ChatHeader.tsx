import { IoChevronBack, IoClose } from "react-icons/io5";
import Logo from "../../assets/Logo.png";

export default function ChatHeader({
  title,
  onBack,
  onClose
}: {
  title: string;
  onBack?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-primary text-white p-4 flex items-center gap-3">
      {/* Back button */}
      {onBack ? (
        <button onClick={onBack} className="text-2xl cursor-pointer">
          <IoChevronBack />
        </button>
      ) : (
        <div className="w-6" />
      )}
      {/* Logo and Title */}
      <div className="flex items-center gap-2 flex-1">
        <img src={Logo} alt="Old Mutual" className="w-7 h-7 object-contain" />
        <span className="text-lg font-semibold">MIA</span>
        <span className="text-base font-normal ml-2">{title}</span>
      </div>
      {/* Close */}
      <button onClick={onClose} className="text-2xl cursor-pointer">
        <IoClose />
      </button>
    </div>
  );
}
