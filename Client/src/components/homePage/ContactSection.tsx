import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";

const ContactSection = () => {
    return (
        <section
            id="contact"
            className="scroll-mt-32 relative w-full bg-gradient-to-b from-[#C7DFF5] to-[#91C0EC] pt-32 pb-16 px-6 md:px-20 flex flex-col md:flex-row gap-12 items-start"
        >
            {/* SVG wave divider on top */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
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

            {/* Left – Contact Details */}
            <div className="md:w-1/2 w-full flex flex-col">
                <h2 className="text-4xl font-bold text-[#664147] mb-6 font-[Nunito]">
                    Contact Us
                </h2>
                <p className="text-lg text-[#3B3B3B] mb-6 leading-relaxed">
                    Our friendly team is here for you and your furry friends. Feel free to
                    reach out or drop by- we’re always happy to help!
                </p>

                <ul className="space-y-6 text-lg text-[#3B3B3B]">
                    <li className="flex items-start">
                        <MapPin className="w-6 h-6 mr-4 text-[#664147] flex-shrink-0" />
                        <span>
                            51 Snunit St, Karmiel, Israel 2161002
                        </span>

                    </li>
                    <li className="flex items-start">
                        <Phone className="w-6 h-6 mr-4 text-[#664147] flex-shrink-0" />
                        <a href="tel:+97241234567" className="hover:underline">
                            +972&nbsp;4&nbsp;123&nbsp;4567
                        </a>
                    </li>
                    <li className="flex items-start">
                        <Mail className="w-6 h-6 mr-4 text-[#664147] flex-shrink-0" />
                        <a href="mailto:info@fureverfriends.com" className="hover:underline">
                            info@fureverfriends.com
                        </a>
                    </li>
                </ul>

                <div className="mt-6">
                    <h3 className="text-2xl font-semibold mb-4 text-[#664147]">
                        Opening Hours:
                    </h3>
                    <table className="text-lg text-[#3B3B3B]">
                        <tbody>
                            <tr>
                                <td className="pr-4 font-medium">Sun-Thu:</td>
                                <td>08:00 - 20:00</td>
                            </tr>
                            <tr>
                                <td className="pr-4 font-medium">Friday:</td>
                                <td>08:00 - 13:00</td>
                            </tr>
                            <tr>
                                <td className="pr-4 font-medium">Saturday:</td>
                                <td>Closed</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right – Google Map */}
            <div className="md:w-1/2 w-full h-64 md:h-[450px] rounded-2xl overflow-hidden shadow-lg">
                <iframe
                    title="Clinic Location Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3393.353644035282!2d35.27962437574782!3d32.91355037361539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151c333334df8b1d%3A0xf4846caa6dd2d203!2z15HXqNeQ15XXk9eUINeb16rXldeR16s!5e0!3m2!1she!2sil!4v1715610189205!5m2!1she!2sil"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />

            </div>
        </section>
    );
};

export default ContactSection;