import React from 'react';

interface TeamMemberCardProps {
  image: string;
  name: string;
  role: string;
  description: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ image, name, role, description }) => {
  return (
    <div className="flex-shrink-0 w-64 bg-[#FDF6F0] rounded-2xl shadow-md p-4 m-2 text-center">
      <img src={image} alt={name} className="w-full h-70 object-cover rounded-xl mb-4" />
      <h3 className="text-xl font-[Nunito] font-bold text-[#664147]">{name}</h3>
      <p className="text-[#3B3B3B] italic text-sm">{role}</p>
      <p className="text-[#3B3B3B] text-sm mt-2">{description}</p>
    </div>
  );
};

export default TeamMemberCard;