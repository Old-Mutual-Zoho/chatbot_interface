import Logo from "../../../assets/Logo.png";

export const LoadingBubble: React.FC = () => {
  return (
    <div className="flex justify-start mb-2 animate-fade-in gap-2 items-end">
      <img src={Logo} alt="Old Mutual" className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0" />
      <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-primary/15 shadow-md" style={{ borderRadius: '18px 18px 18px 4px' }}>
        <div className="flex space-x-2">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
};
