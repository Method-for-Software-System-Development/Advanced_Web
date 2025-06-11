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
  });  return (
    <div className="bg-[var(--color-cream)] dark:bg-[#4A2F33] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 w-full text-[var(--color-greyText)] dark:text-gray-200 sm:mobile:p-3 sm:mobile:rounded-lg sm:mobile:shadow-sm border border-gray-100 dark:border-gray-600">      {/* Pet Name Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-[20px] sm:text-2xl font-bold text-[var(--color-wine)] dark:text-[#FDF6F0]">
            {petName}
          </h2>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium ml-2 flex-shrink-0">
          {formattedDate}
        </div>
      </div>
        {/* Desktop view - Treatment Details Grid */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] w-32 flex-shrink-0">Treating Vet:</span>
              <span className="text-sm text-[var(--color-greyText)] dark:text-gray-200">
                {vetName || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] w-32 flex-shrink-0">Visit Type:</span>
              <span className="text-sm text-[var(--color-greyText)] dark:text-gray-200">
                {visitationType}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0]"> Cost:</span>
              <span className="text-sm font-semibold text-[var(--color-greyText)] dark:text-gray-200">
                {cost.toFixed(2)}$
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile stacked view */}
      <div className="sm:hidden">
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Treating Vet:</span>
          <span className="text-xs text-right break-words">{vetName || "Unknown"}</span>
        </div>
        <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
        
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Visit Type:</span>
          <span className="text-xs text-right break-words">{visitationType}</span>
        </div>
        <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
        
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Cost:</span>
          <span className="text-xs text-right">{cost.toFixed(2)}$</span>
        </div>
      </div>      {/* Description Section */}
      {description && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white dark:bg-blue-900 rounded-lg border border-gray-200 dark:border-blue-600">
          {/* Desktop view */}
          <div className="hidden sm:flex sm:items-start">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] sm:mr-3 mb-1 sm:mb-0 flex-shrink-0">Description:</span>
            <p className="text-sm sm:text-base text-black dark:text-gray-200 leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap flex-1">{description}</p>
          </div>
            {/* Mobile view */}
          <div className="sm:hidden">
            <div className="flex justify-between items-start py-2">
              <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Description:</span>
            </div>
            <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0] mt-1 pt-2">
              <p className="text-xs text-black dark:text-gray-200 leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap">{description}</p>
            </div>
          </div>
        </div>
      )}      {/* Notes Section */}
      {notes && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white dark:bg-[#4A2F33] rounded-lg border border-gray-200 dark:border-gray-600">
          {/* Desktop view */}
          <div className="hidden sm:flex sm:items-start">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] sm:mr-3 mb-1 sm:mb-0 flex-shrink-0">Notes:</span>
            <p className="text-sm sm:text-base text-black dark:text-gray-300 leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap flex-1">{notes}</p>
          </div>
          
          {/* Mobile view */}
          <div className="sm:hidden">
            <div className="flex justify-between items-start py-2">
              <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Notes:</span>
            </div>
            <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0] mt-1 pt-2">
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap">{notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentCard;
