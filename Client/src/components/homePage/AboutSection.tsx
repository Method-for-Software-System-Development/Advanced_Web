import React from 'react';
import { useNavigate } from 'react-router-dom';
import cuteDog from '../../assets/aboutSecImg.png';

/**
 * Props for the AboutSection component
 */
interface AboutSectionProps {
  /** Callback function triggered when login is required */
  onLoginClick?: () => void;
}

/**
 * About section component for the homepage that introduces the FurEver Friends Pet Clinic.
 * Displays clinic information and provides a call-to-action button for booking appointments.
 * Handles authentication and role-based navigation for appointment booking.
 */

const AboutSection: React.FC<AboutSectionProps> = ({ onLoginClick }) => {
  const navigate = useNavigate();

  /**
   * Handle appointment booking button click with authentication check
   * and role-based navigation
   */
  const handleBookAppointmentClick = () => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    // Redirect to login if user is not authenticated
    if (!token) {
      if (onLoginClick) {
        onLoginClick();
      }
      return;
    }

    // Navigate to appropriate dashboard based on user role
    if (role === "secretary") {
      navigate("/secretary");
      // Signal to show appointment form directly
      sessionStorage.setItem("navigateToAddAppointment", "true");
    } else {
      navigate("/client");
      // Signal to show appointment form directly
      sessionStorage.setItem("navigateToAddAppointment", "true");
    }
  };

  return (
    <section id="about" className="scroll-mt-32 px-6 md:px-20 pb-0 flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-b from-[#F5D2B3] to-[#FDF6F0]">
      
      {/* Clinic information */}
      <div className="flex-1 text-center md:text-left self-center">
        <h2 className="font-[Nunito] text-4xl font-bold text-[#664147] mb-6">Who We Are</h2>
        <p className="text-lg text-[#3B3B3B] mb-6 leading-relaxed">
          At <span className="font-bold">FurEver Friends</span>, we care for your pets as if they were our own. With years of experience and a deep love for animals, our expert team of veterinarians and caregivers is dedicated to delivering compassionate, personalized care tailored to each pet’s unique needs.
          <br /><br />
          Whether it’s a routine check-up, preventive care, or specialized treatment, we strive to create a calm, welcoming environment where both pets and their owners feel safe and understood.
          We believe in building long-term relationships based on trust, empathy, and medical excellence- because your pet deserves nothing less.
          <br /><br />
          <span className="font-semibold text-[#664147]">Schedule a free introductory consultation or your first appointment today.</span>
        </p>

        {/* Appointment booking button */}
        <div className="flex justify-center mt-10 mb-20">
          <button
            onClick={handleBookAppointmentClick}
            className="inline-block bg-[#664147] font-[Nunito] font-bold text-white px-10 py-2 text-2xl rounded-full hover:bg-[#58383E] transform transition duration-200 hover:scale-110 cursor-pointer"
          >
            Book an Appointment
          </button>
        </div>
      </div>
      
      {/* Decorative image */}
      <div className="flex-1 self-end">
        <img src={cuteDog} alt="Cute Dog" className="max-h-[600px] w-auto object-contain mx-auto" />
      </div>

    </section>
  );
};

export default AboutSection;