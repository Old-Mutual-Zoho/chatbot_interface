import { IoChevronBack, IoClose } from "react-icons/io5";
// import Logo from "../../assets/Logo.png";
import bot from "../../assets/bot.png";


type AgentConfig = {
  name: string;
  avatar: string;
  status: string;
};

type ChatHeaderProps = {
  title: string;
  onBack?: () => void;
  onClose: () => void;
  agentConfig?: AgentConfig;
  chatMode?: 'bot' | 'human';
};

export default function ChatHeader({ title, onBack, onClose, agentConfig, chatMode }: ChatHeaderProps) {
  // Use agentConfig if in human mode, else default bot config
  const isHuman = chatMode === 'human' && agentConfig;
  const avatarSrc = isHuman ? agentConfig!.avatar : bot;
  const displayName = isHuman ? agentConfig!.name : 'MIA';
  const status = isHuman ? agentConfig!.status : 'Online';
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
        <img src={avatarSrc} alt={displayName} className="w-7 h-7 object-contain rounded-full" />
        <span className="text-lg font-semibold">{displayName}</span>
        <span className="text-base font-normal ml-2">{title}</span>
        {/* Status dot */}
        <span className="flex items-center ml-3">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-1" />
          <span className="text-xs">{status}</span>
        </span>
      </div>
      {/* Close returns control to the host page */}
      <button onClick={onClose} className="text-2xl cursor-pointer">
        <IoClose />
      </button>
    </div>
  );
}
