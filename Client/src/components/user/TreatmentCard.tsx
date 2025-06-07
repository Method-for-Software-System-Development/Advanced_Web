import React from "react";

interface TreatmentCardProps {
  petName: string;
  visitDate: string;
  vetName: string | null | undefined;
  visitationType: string;
  cost: number;
  notes: string;
  description?: string;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({
  petName,
  visitDate,
  vetName,
  visitationType,
  cost,
  notes,
  description,
}) => {
  // Format the date more elegantly
  const formattedDate = new Date(visitDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return (
    <div className="bg-[var(--color-cream)] dark:bg-[#4A2F33] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 w-full text-[var(--color-greyText)] dark:text-gray-200 mobile:p-3 mobile:rounded-lg mobile:shadow-sm border border-gray-100 dark:border-gray-600">
      {/* Pet Name Header */}      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mobile:text-lg">
          🐾 {petName}
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {formattedDate}
        </div>
      </div>
      
      {/* Treatment Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0]">👨‍⚕️ Treating Vet:</span>
            <span className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded-full text-sm dark:text-blue-100">
              {vetName || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0]">📋 Visit Type:</span>
            <span className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded-full text-sm dark:text-green-100">
              {visitationType}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0]">💰 Cost:</span>
            <span className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded-full text-sm font-semibold dark:text-yellow-100">
              ${cost.toFixed(2)}
            </span>
          </div>
        </div></div>      {/* Description Section */}
      {description && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] flex-shrink-0">📋 Description:</span>
            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg flex-1">
              <span className="whitespace-pre-wrap text-sm leading-relaxed dark:text-blue-100">
                {description}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {notes && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] flex-shrink-0">📝 Notes:</span>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex-1">
              <span className="whitespace-pre-wrap text-sm leading-relaxed dark:text-gray-200">
                {notes}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentCard;
