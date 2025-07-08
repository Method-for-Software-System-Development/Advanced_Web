import React, { useEffect, useState } from "react";
import TeamMemberCard from "./TeamMemberCard";
import staffService from "../../services/staffService";
import { Staff } from "../../types";
import { API_BASE_URL } from "../../config/api";

/**
 * Maps backend role identifiers to user-friendly display names.
 * @param role - The staff member's role identifier from the database
 * @returns User-friendly role display string
 */
function mapRoleToDisplayName(role: string): string {
  switch (role) {
    case "CHIEF_VETERINARIAN":
      return "Chief Veterinarian & Clinic Director";
    case "VETERINARIAN":
      return "Veterinarian";
    case "ASSISTANT":
      return "Veterinary Assistant";
    case "RECEPTIONIST":
      return "Clinic Receptionist";
    default:
      return role;
  }
}

/**
 * Team section component for the homepage that displays clinic staff members.
 * Fetches staff data from the API and renders individual team member cards
 * in a horizontally scrollable layout with decorative wave divider.
 */
const TeamSection: React.FC = () => {
  // Staff members data from API
  const [members, setMembers] = useState<Staff[]>([]);
  // Loading state for data fetching
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetch active staff members from the API on component mount
   */
  useEffect(() => {
    staffService
      .getAllStaff()
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Show loading state while fetching data
  if (loading) {
    return <div className="bg-white dark:bg-wine">Loading team...</div>;
  }
  return (
    <section
      id="team"
      className="scroll-mt-32 relative w-full bg-white dark:bg-wine pt-10 pb-10 px-6 md:px-20"
    >
      {/* Decorative wave divider at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] -translate-y-full rotate-180">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(150%+1.3px)] h-[80px] text-white dark:text-wine"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="currentColor"
            className="fill-current"
          />
        </svg>
      </div>

      {/* Section title */}
      <h2 className="text-4xl font-bold text-[#664147] dark:text-white mb-6 text-center font-[Nunito]">
        Our Team
      </h2>

      {/* Horizontally scrollable team member cards */}
      <div className="flex overflow-x-auto gap-6 team-custom-scrollbar justify-start justify-center-2172">
        {members.map((member) => (
          <TeamMemberCard
            key={member._id}
            image={`${API_BASE_URL}${member.imageUrl}`}
            name={`${member.firstName} ${member.lastName}`}
            role={mapRoleToDisplayName(member.role)}
            description={member.description}
          />
        ))}
      </div>
    </section>
  );
};

export default TeamSection;