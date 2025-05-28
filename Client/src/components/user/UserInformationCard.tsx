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
  <div className="bg-white rounded-xl shadow-md p-6 w-full">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-gray-800">
        {firstName} {lastName}
      </h2>
      {!isEditing && (
        <button
          onClick={onEdit}
          className="w-36 bg-[#664147] text-white px-4 py-1 rounded hover:bg-[#4d3034] font-semibold"
        >
          Edit
        </button>
      )}
    </div>
    <div className="text-gray-700 space-y-4">
      {isEditing ? (
        children // This will be your <EditUserProfile /> component
      ) : (
        <>
          <p>
            <span className="font-semibold text-lg">Email:</span>{" "}
            <span className="text-lg">{email}</span>
          </p>
          <p>
            <span className="font-semibold text-lg">Phone Number:</span>{" "}
            <span className="text-lg">{phone}</span>
          </p>
          <p>
            <span className="font-semibold text-lg">City:</span>{" "}
            <span className="text-lg">{city}</span>
          </p>
        </>
      )}
    </div>
  </div>
);

export default UserInfoCard;
