import React from 'react';
import TeamMemberCard from './TeamMemberCard';
import member1 from '../assets/michael.png';
import member2 from '../assets/sarah.png';
import member3 from '../assets/emily.png';
import member4 from '../assets/anna.png';
import member5 from '../assets/lisa.png';
import member6 from '../assets/noa.png';

const TeamSection = () => {
  return (
    <section id="team" className="w-full bg-white py-16 px-6 md:px-20 shadow-2xl">
      <h2 className="text-4xl font-bold text-[#664147] mb-10 text-center font-[Nunito]">Our Team</h2>
      <div className="flex overflow-x-auto gap-6">
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