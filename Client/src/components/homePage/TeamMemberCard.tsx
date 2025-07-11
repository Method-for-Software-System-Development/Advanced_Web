import React from 'react';

/**
 * Props for the TeamMemberCard component
 */
interface TeamMemberCardProps {
  /** URL or path to the team member's image */
  image: string;
  /** Full name of the team member */
  name: string;
  /** Job title or role at the clinic */
  role: string;
  /** Brief description of the team member's background or expertise */
  description: string;
}

/**
 * Team member card component that displays individual staff information.
 * Used in the team section to showcase clinic staff with their photo,
 * name, role, and a brief description of their background.
 */
const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ image, name, role, description }) => {
  return (
    <div className="flex-shrink-0 w-64 bg-[#FDF6F0] rounded-2xl shadow-md p-4 m-2 text-center">
      {/* Team member photo */}
      <img src={image} alt={name} className="w-full h-70 object-cover rounded-xl mb-4" />

      {/* Team member name */}
      <h3 className="text-xl font-[Nunito] font-bold text-[#664147]">{name}</h3>

      {/* Job title/role */}
      <p className="text-[#3B3B3B] italic text-sm">{role}</p>

      {/* Description/bio */}
      <p className="text-[#3B3B3B] text-sm mt-2">{description}</p>
    </div>
  );
};

export default TeamMemberCard;