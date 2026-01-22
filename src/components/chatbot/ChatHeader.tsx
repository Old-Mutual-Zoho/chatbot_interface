import { IoChevronBack, IoClose } from "react-icons/io5";

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
    <div className="bg-primary  text-white p-4 flex items-center gap-3">

      {/* Back button */}
      {onBack ? (
        <button onClick={onBack} className="text-2xl cursor-pointer">
          <IoChevronBack />
        </button>
      ) : (
        <div className="w-6" />
      )}

      {/* Title */}
      <div className="flex-1 text-lg font-semibold">{title}</div>

      {/* Close */}
      <button onClick={onClose} className="text-2xl cursor-pointer">
        <IoClose />
      </button>
    </div>
  );
}
