import { useCallback, useEffect, useRef, useState } from "react";
import type { BusinessUnit } from "../chat/domain/businessUnits";

export function ChatLandingPanel({
  onPickUnit,
  onSend,
  draft,
  onDraftChange,
}: {
  onPickUnit: (unit: BusinessUnit) => void;
  onSend: () => void;
  draft: string;
  onDraftChange: (value: string) => void;
}) {
  const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | null>(null);
  const pickTimeoutRef = useRef<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pickTimeoutRef.current !== null) {
        window.clearTimeout(pickTimeoutRef.current);
      }

      if (typingTimerRef.current !== null) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const markTyping = useCallback(() => {
    setIsTyping(true);
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 700);
  }, []);

  const sendNow = useCallback(() => {
    onSend();
    setIsTyping(false);
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, [onSend]);

  const units: Array<{
    key: BusinessUnit;
    title: string;
    subtitle: string;
    imageUrl: string;
  }> = [
    {
      key: 'insurance',
      title: 'Insurance and Personal',
      subtitle: 'Cover, policies, claims,benefits',
      imageUrl:
        'https://eu-images.contentstack.com/v3/assets/bltdd392fd32dda3ce8/bltc2a52a7b3af58bdb/678519c6eb2cd4f9c6125a8c/Save_&_Invest_(2).jpg?width=720&format=webp&quality=80',
    },
    {
      key: 'investments',
      title: 'Saving and Investment',
      subtitle: 'Plans, funds, statements',
      imageUrl:
        'https://eu-images.contentstack.com/v3/assets/bltdd392fd32dda3ce8/blt0376e4517909181e/678519937d465384448be775/Home_2Column.jpg?width=720&format=webp&quality=80',
    },
    {
      key: 'business',
      title: 'Business Solutions',
      subtitle: 'SME and corporate support',
      imageUrl:
        'https://www.oldmutual.co.ug/v3/assets/bltdd392fd32dda3ce8/blt7b0a60e9536bf06f/67851a44eb2cd4190c125ab2/Business_hero_copy.webp',
    },
  ];

  return (
    <div className="om-landing">
      <div className="om-landing__units" role="list">
        {units.map((unit) => (
          <div key={unit.key} role="listitem">
            <button
              type="button"
              className={`om-unit${selectedUnit === unit.key ? " om-unit--selected" : ""}`}
              aria-pressed={selectedUnit === unit.key}
              onClick={() => {
                setSelectedUnit(unit.key);
                if (pickTimeoutRef.current !== null) {
                  window.clearTimeout(pickTimeoutRef.current);
                }
                pickTimeoutRef.current = window.setTimeout(() => {
                  onPickUnit(unit.key);
                }, 180);
              }}
            >
              <div className="om-unit__top">
                <div className="om-unit__title">{unit.title}</div>
                <div className="om-unit__subtitle">{unit.subtitle}</div>
              </div>
              <div className="om-unit__image" aria-hidden="true">
                <img src={unit.imageUrl} alt="" />
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="om-landing__input">
        <div className="chat-input-container">
          <input
            className={`chat-input${isTyping ? " is-typing" : ""}`}
            type="text"
            value={draft}
            onChange={(e) => {
              onDraftChange(e.target.value);
              markTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendNow();
            }}
            placeholder="Type your message…"
          />
          <button
            className="btn btn-send"
            onClick={sendNow}
            disabled={!draft.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
