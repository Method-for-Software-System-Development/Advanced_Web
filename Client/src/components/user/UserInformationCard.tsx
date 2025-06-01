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
}) => (
  <div className="bg-white rounded-xl shadow-md p-6 w-full mx-auto sm:p-4 xs:p-2">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
      <h2 className="text-2xl sm:text-xl font-bold text-gray-800">
        {firstName} {lastName}
      </h2>
      {!isEditing && (
        <button
          onClick={onEdit}
          className="w-36 sm:w-32 bg-[#664147] text-white px-4 py-1 rounded hover:bg-[#4d3034] font-semibold text-base sm:text-sm"
        >
          Edit
        </button>
      )}
    </div>
    <div className="text-gray-700 space-y-4 text-base">
      {isEditing ? (
        children // This will be your <EditUserProfile /> component
      ) : (
        <>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            <span className="break-all max-w-full block whitespace-normal overflow-hidden">
              {email}
            </span>
          </p>
          <p>
            <span className="font-semibold">Phone Number:</span>{" "}
            <span>{phone}</span>
          </p>
          <p>
            <span className="font-semibold">City:</span>{" "}
            <span>{city}</span>
          </p>
        </>
      )}
    </div>
  </div>
);

export default UserInfoCard;
