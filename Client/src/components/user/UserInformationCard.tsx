import React from "react";

interface UserInfoCardProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  isEditing: boolean;
  onEdit: () => void;
  children?: React.ReactNode; // For edit form
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  firstName,
  lastName,
  email,
  phone,
  city,
  isEditing,
  onEdit,
  children,
}) => {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
  <div className="bg-[var(--color-sky)] border-2 border-[var(--color-wine)] rounded-2xl shadow-lg w-full mx-auto sm:p-8 p-6 mobile:p-2 mobile:w-screen mobile:rounded-none">
      {/* Name and Edit button layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-2 sm:gap-0">
        <h2 className="text-3xl font-bold text-[var(--color-wine)] font-[Nunito] tracking-tight drop-shadow block sm:text-3xl">
          {capitalize(firstName)} {capitalize(lastName)}
        </h2>
        {/* Edit button for desktop only */}
        {!isEditing && (
          <button
            onClick={onEdit}
            className="hidden sm:block w-36 sm:w-32 bg-[var(--color-wine)] text-white px-6 py-2 rounded-full hover:bg-[var(--color-wineDark)] font-bold text-lg sm:text-base transition-colors duration-150 shadow-lg"
          >
            Edit
          </button>
        )}
      </div>
      <div className="text-[var(--color-greyText)] space-y-6 font-[Poppins] text-base sm:text-lg">
        {isEditing ? (
          children // This will be your <EditUserProfile /> component
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center flex-wrap">
              <span className="font-bold text-[var(--color-wine)] mr-2">Email:</span>
              <span className="break-all sm:break-normal max-w-full whitespace-nowrap overflow-x-auto text-base sm:text-lg">{email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-bold text-[var(--color-wine)] whitespace-nowrap">Phone Number:</span>
              <span className="whitespace-nowrap overflow-x-auto text-base sm:text-lg sm:ml-2">{phone}</span>
            </div>            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-bold text-[var(--color-wine)] whitespace-nowrap">City:</span>
              <span className="whitespace-nowrap overflow-x-auto text-base sm:text-lg sm:ml-2">{capitalize(city)}</span>
            </div>
            {/* Edit button for mobile only */}
            {!isEditing && (
              <button
                onClick={onEdit}
                className="block sm:hidden w-full bg-[var(--color-wine)] text-white px-6 py-2 rounded-full hover:bg-[var(--color-wineDark)] font-bold text-base transition-colors duration-150 shadow-lg mt-4"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoCard;
