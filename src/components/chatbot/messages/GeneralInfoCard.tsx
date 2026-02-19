import type { GeneralInformation } from '../../../services/api';

interface GeneralInfoCardProps {
  info: GeneralInformation;
  onClose: () => void;
}

export function GeneralInfoCard({ info, onClose }: GeneralInfoCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <h2 className="text-lg font-bold mb-2">General Information</h2>
      {info.definition && (
        <div className="mb-3">
          <div className="font-semibold">Definition:</div>
          <div className="text-gray-700">{info.definition}</div>
        </div>
      )}
      {info.benefits && info.benefits.length > 0 && (
        <div className="mb-3">
          <div className="font-semibold">Benefits:</div>
          <ul className="list-disc ml-5 text-gray-700">
            {info.benefits.map((b: string, i: number) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
      {info.eligibility && (
        <div className="mb-3">
          <div className="font-semibold">Eligibility:</div>
          <div className="text-gray-700">{info.eligibility}</div>
        </div>
      )}
    </div>
  );
}
