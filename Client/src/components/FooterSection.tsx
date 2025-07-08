import React from "react";

/**
 * Footer component for the FurEver Friends Pet Clinic application.
 * Displays project information and attribution at the bottom of the page.
 */
const FooterSection = () => {
  return (
    <footer className="w-full bg-[#3B3B3B] py-4 text-center shadow-md">
      {/* Project attribution and date */}
      <p className="text-sm text-white">
        Semester project by Group 4 in the "Advanced Web Technologies" course<br />
        July 2025
      </p>
    </footer>
  );
};

export default FooterSection;