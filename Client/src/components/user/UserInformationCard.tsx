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
    <div className="bg-[var(--color-sky)] border-2 border-[var(--color-wine)] rounded-2xl shadow-lg p-10 w-full mx-auto sm:p-8 xs:p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-2 sm:gap-0">
        <h2 className="text-4xl sm:text-3xl font-extrabold text-[var(--color-wine)] font-[Nunito] tracking-tight drop-shadow">
          {capitalize(firstName)} {capitalize(lastName)}
        </h2>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="w-36 sm:w-32 bg-[var(--color-wine)] text-white px-6 py-2 rounded-full hover:bg-[var(--color-wineDark)] font-bold text-lg sm:text-base transition-colors duration-150 shadow-lg"
          >
            Edit
          </button>
        )}
      </div>
      <div className="text-[var(--color-greyText)] space-y-6 text-lg font-[Poppins]">
        {isEditing ? (
          children // This will be your <EditUserProfile /> component
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center flex-wrap">
              <span className="font-bold text-[var(--color-wine)] mr-2">Email:</span>
              <span className="break-all max-w-full whitespace-normal overflow-hidden">{email}</span>
            </div>
            <div>
              <span className="font-bold text-[var(--color-wine)]">Phone Number:</span>{" "}
              <span>{phone}</span>
            </div>
            <div>
              <span className="font-bold text-[var(--color-wine)]">City:</span>{" "}
              <span>{city}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoCard;
