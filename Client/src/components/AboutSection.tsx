import React from 'react';
import cuteDog from '../assets/aboutSecImg.png';

const AboutSection = () => {
  return (
    <section id="about" className="px-6 md:px-20 pb-0 flex flex-col md:flex-row items-center justify-between gap-12">  
        {/* Text */}
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
            <div className="flex justify-center mt-10">
                <a href="#" className="bg-[#91C0EC] font-[Nunito] font-bold text-white px-10 py-2 text-2xl rounded-full hover:bg-[#3B3B3B] transform transition duration-200">Book an Appointment</a>
            </div>
        </div>

        {/* Image */}
        <div className="flex-1 self-end"><img src={cuteDog} alt="Cute Dog" className="max-h-[600px] w-auto object-contain mx-auto"/></div>

    </section>
  );
};

export default AboutSection;