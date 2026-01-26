import WelcomeImage from "../../../assets/Welcome.png";

export default function CustomWelcomeCard() {
  return (
    <div className="flex flex-col items-center bg-[#e6f7ef] rounded-2xl shadow-md px-4 py-6 mb-2 animate-fade-in">
      <img
        src={WelcomeImage}
        alt="Welcome Bot"
        className="w-60 h-auto object-contain mb-4"
      />
      <div className="font-semibold text-lg text-primary mb-1 text-center">Hi, I'm MIA! 😊</div>
      <div className="text-gray-700 text-sm text-center">I'm here to make your experience smooth and enjoyable.</div>
    </div>
  );
}
