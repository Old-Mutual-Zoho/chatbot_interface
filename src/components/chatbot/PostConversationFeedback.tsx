import { useEffect, useMemo, useState } from "react";

type PostConversationFeedbackProps = {
  isConversationEnded: boolean;
  onSubmitFeedback?: (payload: { rating: number; feedback: string }) => void;
};

const StarIcon = ({ filled }: { filled: boolean }) => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={[
        "h-7 w-7 transition-colors duration-200 ease-in-out",
        filled ? "text-[#006341]" : "text-gray-300",
      ].join(" ")}
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.172c.969 0 1.371 1.24.588 1.81l-3.376 2.454a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.377-2.453a1 1 0 00-1.175 0l-3.377 2.453c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.053 9.394c-.784-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69l1.285-3.967z" />
    </svg>
  );
};

export default function PostConversationFeedback({
  isConversationEnded,
  onSubmitFeedback,
}: PostConversationFeedbackProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [submitStage, setSubmitStage] = useState<"idle" | "thanks">("idle");

  useEffect(() => {
    if (!isConversationEnded) return;
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, [isConversationEnded]);

  const activeRating = hoverRating ?? rating;

  const starItems = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }, []);

  if (!isConversationEnded) return null;

  const handleSubmit = () => {
    if (rating == null) return;
    // Show a brief thank-you message before the parent closes/exits.
    setSubmitStage("thanks");
    setHoverRating(null);
    window.setTimeout(() => {
      onSubmitFeedback?.({ rating, feedback });
    }, 1200);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className={[
          "max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 w-full",
          "border border-[#006341]/15",
          "transform transition-all duration-300 ease-out",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95",
        ].join(" ")}
        style={{
          boxShadow:
            "0 18px 50px rgba(0, 99, 65, 0.28), 0 8px 18px rgba(0, 99, 65, 0.18)",
        }}
      >
        {submitStage === "thanks" ? (
          <div className="text-center py-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[#006341]">Thank you!</h2>
            <p className="mt-2 text-sm sm:text-base text-[#006341]">Your feedback has been submitted.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-[#006341]">This conversation has ended</h2>
              <p className="mt-1 text-sm sm:text-base text-[#006341]">How was your experience?</p>
            </div>

            {/* Stars */}
            <div className="mt-6">
              <div role="radiogroup" aria-label="Rate your experience" className="flex justify-center gap-2">
                {starItems.map((value) => {
                  const filled = !!activeRating && value <= activeRating;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={rating === value}
                      aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                      className="rounded focus:outline-none focus:ring-2 focus:ring-[#006341] focus:ring-offset-2"
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(null)}
                      onFocus={() => setHoverRating(value)}
                      onBlur={() => setHoverRating(null)}
                      onClick={() => setRating(value)}
                    >
                      <StarIcon filled={filled} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-[#006341]">
                <span>Very poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Textarea */}
            {rating !== null && (
              <div className="mt-5">
                <label htmlFor="post-convo-feedback" className="sr-only">
                  Additional feedback
                </label>
                <textarea
                  id="post-convo-feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us more about your experience (optional)"
                  rows={4}
                  className={[
                    "w-full rounded-lg border border-[#006341]/30 px-3 py-2 text-sm",
                    "text-[#006341] placeholder:text-[#006341]/60",
                    "focus:outline-none focus:ring-2 focus:ring-[#006341] focus:border-[#006341]",
                  ].join(" ")}
                />
              </div>
            )}

            {/* Actions */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={rating === null}
                className={[
                  "w-full rounded-xl px-4 py-2.5 text-sm font-semibold",
                  "bg-[#006341] text-white",
                  "transition-colors duration-200 ease-in-out",
                  "hover:bg-[#005a3a]",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-2 focus:ring-[#006341] focus:ring-offset-2",
                ].join(" ")}
              >
                Submit feedback
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
