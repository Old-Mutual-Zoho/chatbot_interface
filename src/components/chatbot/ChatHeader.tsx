
import React from "react";
import { IoChevronBack, IoClose, IoExpandOutline, IoContractOutline } from "react-icons/io5";
import Logo from "../../assets/Logo.png";

type AgentConfig = {
  name: string;
  avatar: string;
  status: string;
};

type ChatHeaderProps = {
  onBack?: () => void;
  onClose: () => void;
  agentConfig?: AgentConfig;
  chatMode?: 'bot' | 'human';
  isExpanded?: boolean;
  onToggleExpand?: () => void;
};


const ChatHeader: React.FC<ChatHeaderProps> = ({ onBack, onClose, agentConfig, chatMode, isExpanded, onToggleExpand }) => {
  const isHuman = chatMode === 'human' && agentConfig;
  const avatarSrc = isHuman ? agentConfig!.avatar : Logo;
  const displayName = isHuman ? agentConfig!.name : 'MIA';
  const status = isHuman ? agentConfig!.status : 'Online';
  return (
    <div className="shrink-0 bg-primary text-white px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
      {onBack ? (
        <button onClick={onBack} className="flex items-center text-white hover:bg-white/10 p-1 rounded transition cursor-pointer flex-shrink-0" title="Back">
          <IoChevronBack size={18} className="sm:block" />
        </button>
      ) : (
        <div className="w-6" />
      )}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
          <img src={avatarSrc} alt={displayName} className="w-full h-full object-contain rounded-full" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full" title="Online"></span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-white text-xs sm:text-sm truncate">{displayName}</span>
          <span className="text-xs text-white/80 leading-tight">{status}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onToggleExpand}
          className="flex items-center text-white hover:bg-white/10 p-1 rounded transition cursor-pointer"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <IoContractOutline size={18} className="sm:block" /> : <IoExpandOutline size={18} className="sm:block" />}
        </button>
        <button onClick={onClose} className="flex items-center text-white hover:bg-white/10 p-1 rounded transition cursor-pointer" title="Close">
          <IoClose size={18} className="sm:block" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

