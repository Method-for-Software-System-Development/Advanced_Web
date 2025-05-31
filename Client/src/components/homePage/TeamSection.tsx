import React from 'react';
import TeamMemberCard from './TeamMemberCard';
import member1 from '../../assets/michael.png';
import member2 from '../../assets/sarah.png';
import member3 from '../../assets/emily.png';
import member4 from '../../assets/anna.png';
import member5 from '../../assets/lisa.png';
import member6 from '../../assets/noa.png';

const TeamSection = () => {
  return (
    <section id="team" className="scroll-mt-32 relative w-full bg-white dark:bg-wine pt-10 pb-10 px-6 md:px-20">

      {/* SVG Shape Divider – Positioned at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] -translate-y-full rotate-180">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(150%+1.3px)] h-[80px] text-white dark:text-wine"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="currentColor" /* text color changes with mode */
            className="fill-current"
          />
        </svg>
      </div>

      <h2 className="text-4xl font-bold text-[#664147] dark:text-white mb-6 text-center font-[Nunito]">Our Team</h2>
      <div className="flex overflow-x-auto gap-6 custom-scrollbar 2xl:justify-center">
        <TeamMemberCard
          image={member1}
          name="Dr. Michael Levin"
          role="Chief Veterinarian & Clinic Director"
          description="With 15+ years of experience, Dr. Levin leads the team with compassion, precision, and a love for all creatures great and small."
        />
        <TeamMemberCard
          image={member2}
          name="Dr. Sarah White"
          role="Veterinarian"
          description="Loves working with dogs and helping rescue animals thrive."
        />
        <TeamMemberCard
          image={member3}
          name="Emily Rivera"
          role="Veterinary Assistant"
          description="Compassionate and skilled in gentle handling of nervous pets."
        />
        <TeamMemberCard
          image={member4}
          name="Anna Morales"
          role="Veterinary Assistant"
          description="Skilled in calming anxious pets and assisting in daily procedures with a gentle hand and a big heart."
        />
        <TeamMemberCard
          image={member5}
          name="Lisa Cohen"
          role="Veterinary Assistant"
          description="Always ready with a smile, Lisa ensures smooth care routines and supports both vets and pet parents."
        />
        <TeamMemberCard
          image={member6}
          name="Noa Shapiro"
          role="Clinic Receptionist"
          description="The friendly voice who greets every client. Noa coordinates appointments and keeps everything running efficiently."
        />
      </div>

    </section>
  );
};

export default TeamSection;