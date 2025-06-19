import React from "react";
import { Edit } from 'lucide-react';

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
  <div className="bg-sky dark:bg-darkMode border-2 border-skyDark dark:border-darkModeDark rounded-2xl shadow-lg w-full mx-auto sm:p-6 p-4 mobile:p-2 mobile:w-screen mobile:rounded-none">
    {/* Name layout */}      
      <div className="flex flex-col">
        <h2 className="text-2xl sm:text-4xl font-bold text-wine dark:text-white mb-1 font-[Nunito]">
          Welcome Back, {capitalize(firstName)} {capitalize(lastName)}
        </h2>
      </div>
      <div className="text-grayText dark:text-white text-base sm:text-lg">        {isEditing ? (
          children // This will be your <EditUserProfile /> component
        ) : (          <div className="flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-4 text-sm sm:text-base items-center">
              <div className="flex items-center justify-start">
                <span className="font-bold text-wine dark:text-lightGrayText mr-2">Email:</span>
                <span className="break-all">{email}</span>
              </div>
              <div className="flex items-center justify-start">
                <span className="font-bold text-wine dark:text-lightGrayText mr-2">Mobile:</span>
                <span className="whitespace-nowrap">{phone}</span>
              </div>
              <div className="flex items-center justify-start">
                <span className="font-bold text-wine dark:text-lightGrayText mr-2">Address:</span>
                <span className="whitespace-nowrap">{capitalize(city)}</span>
              </div>              {/* Edit button for desktop - now in the same row */}
              {!isEditing && (
                <div className="hidden lg:flex justify-end">
                  <button
                    onClick={onEdit}
                    className="flex items-center justify-center gap-2 h-11 bg-wine text-white font-bold rounded-full hover:bg-wineDark transition-colors duration-200 cursor-pointer px-6"
                  >
                    <Edit size={20} />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>            {/* Edit button for mobile only */}
            {!isEditing && (
              <button
                onClick={onEdit}
                className="flex lg:hidden items-center justify-center gap-2 h-11 bg-wine text-white font-bold rounded-full hover:bg-wineDark transition-colors duration-200 cursor-pointer w-full mt-4"
              >
                <Edit size={20} />
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoCard;
