import React from 'react';

export type PolicyGuideTab = 'policy' | 'guide';

export type PolicyGuideModalProps = {
  open: boolean;
  onClose: () => void;
  initialTab?: PolicyGuideTab;
};

export const PolicyGuideModal: React.FC<PolicyGuideModalProps> = ({ open, onClose, initialTab = 'policy' }) => {
  const [tab, setTab] = React.useState<PolicyGuideTab>(initialTab);

  React.useEffect(() => {
    if (!open) return;
    setTab(initialTab);
  }, [open, initialTab]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const tabButtonClass = (active: boolean) =>
    [
      'px-3 py-1.5 rounded-lg text-sm font-medium border transition',
      active ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary',
    ].join(' ');

  return (
    <>
      <button
        type="button"
        aria-label="Close policy and guide"
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/30"
      />
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Policy and guide"
          className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
            <div className="text-base font-semibold text-gray-900">Policy &amp; Guide</div>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:border-primary"
            >
              Close
            </button>
          </div>

          <div className="px-5 pt-3">
            <div className="flex gap-2">
              <button type="button" className={tabButtonClass(tab === 'policy')} onClick={() => setTab('policy')}>
                Policy
              </button>
              <button type="button" className={tabButtonClass(tab === 'guide')} onClick={() => setTab('guide')}>
                Guide
              </button>
            </div>
          </div>

          <div className="px-5 py-4 overflow-y-auto max-h-[75vh]">
            {tab === 'policy' ? (
              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                <p className="font-medium text-gray-900">Privacy / Data Use (Summary)</p>
                <p>
                  We collect the information you provide to generate your quote and provide the requested service. We only use your
                  details for this purpose unless you separately opt in to other uses.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>We may store your responses to improve the quoting experience and support your session.</li>
                  <li>We may share necessary details with our service providers to deliver the quote/payment process.</li>
                  <li>You can request corrections or deletion subject to legal/operational requirements.</li>
                </ul>
                <p className="text-xs text-gray-500">
                  Replace this summary with your full policy text and version information as needed.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                <p className="font-medium text-gray-900">How quoting works</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Answer the questions step-by-step and review your details before submission.</li>
                  <li>Provide accurate information to avoid delays and improve quote quality.</li>
                </ul>

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="font-medium text-amber-900">Important notice about premium</p>
                  <p className="text-amber-900/90 mt-1">
                    Any premium shown may be indicative and can change after all information is collected and eligibility/underwriting
                    rules are applied. It is not a binding offer.
                  </p>
                </div>

                <p className="text-xs text-gray-500">Replace this guide content with your final customer-facing guide.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
