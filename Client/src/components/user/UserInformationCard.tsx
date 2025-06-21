import React from "react";
import { Edit, BookOpen } from 'lucide-react';

interface UserInfoCardProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  street: string;
  postalCode?: string; // Optional postal code
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
  street,
  postalCode,
  isEditing,
  onEdit,
  children,
}) => {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <div className="bg-sky dark:bg-darkMode border-2 border-skyDark dark:border-darkModeDark rounded-2xl shadow-lg w-full mx-auto sm:p-6 p-4 mobile:p-2 mobile:w-screen mobile:rounded-none">      {/* Name layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-2xl sm:text-4xl font-bold text-wine dark:text-white font-[Nunito]">
          Welcome Back, {capitalize(firstName)} {capitalize(lastName)}
        </h2>        {/* Tutorial button in header */}
        {!isEditing && (
          <button
            onClick={() => {/* TODO: Add tutorial navigation logic */ }}
            className="hidden sm:flex items-center justify-center gap-2 w-40 h-11 bg-wine text-white font-bold rounded-full hover:bg-wineDark transition-colors duration-200 cursor-pointer"
          >
            <BookOpen size={20} />
            Tutorial
          </button>
        )}      </div>

      <div className="text-grayText dark:text-white text-base sm:text-lg">
        {isEditing ? (
          children // This will be your <EditUserProfile /> component
        ) : (
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm sm:text-base">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-22">

                <div className="flex items-center justify-start">
                  <span className="font-bold text-wine dark:text-lightGrayText mr-2 md:mr-2 w-16 sm:w-auto">Email:</span>
                  <span className="break-all">{email}</span>
                </div>
                <div className="flex items-center justify-start">
                  <span className="font-bold text-wine dark:text-lightGrayText mr-2 md:mr-2 w-16 sm:w-auto">Mobile:</span>
                  <span className="whitespace-nowrap">{phone}</span>
                </div>
                <div className="flex items-center justify-start">
                  <span className="font-bold text-wine dark:text-lightGrayText mr-2 md:mr-2 w-16 sm:w-auto">Address:</span>
                  <span className="whitespace-nowrap">{capitalize(street)}, {capitalize(city)} {postalCode}</span>
                </div>

              </div>

              {/* Desktop edit button - now in the same row */}
              {!isEditing && (
                <div className="hidden md:flex">
                  <button
                    onClick={onEdit}
                    className="flex items-center justify-center gap-2 w-40 h-11 bg-wine text-white font-bold rounded-full hover:bg-wineDark transition-colors duration-200 cursor-pointer"
                  >
                    <Edit size={20} />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>            {/* Mobile buttons */}
            {!isEditing && (
              <div className="flex md:hidden flex-col gap-3 w-full mt-4">
                <button
                  onClick={() => {/* TODO: Add tutorial navigation logic */ }}
                  className="flex items-center justify-center gap-2 h-11 bg-wine text-white font-bold rounded-full hover:bg-wineDark transition-colors duration-200 cursor-pointer w-full"
                >
                  <BookOpen size={20} />
                  Tutorial
                </button>
                <button
                  onClick={onEdit}
                  className="flex items-center justify-center gap-2 h-11 bg-wine text-white font-bold rounded-full hover:bg-wineDark transition-colors duration-200 cursor-pointer w-full"
                >
                  <Edit size={20} />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoCard;