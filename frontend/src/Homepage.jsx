import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import images from assets folder
import service1Img from "./assets/doctors.jpg";
import service2Img from "./assets/lungs.png";
import service3Img from "./assets/logo.png";
import logoImage from "./assets/logo.png";

import img1 from "./assets/lung-image.png";
import img2 from "./assets/lung-inspection.png";
import img3 from "./assets/service-1stimg.png";

const PulmoVisionHomepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow images
  const slides = [
    { image: service1Img },
    { image: service2Img },
    { image: service3Img },
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Statistics data
  const stats = [
    { number: "99%", label: "Positive Feedback" },
    { number: "1000+", label: "Active Health Workers" },
    { number: "24/7", label: "AI-Powered System Running" },
  ];

  // Services data with images
  const services = [
    {
      description: "Empowering Diagnosis with the Precision of AI",
      image: img1,
    },
    {
      description: "Early detection of TB and Pneumonia",
      image: img2,
    },
    {
      description: "X-ray powered insights for smarter lung analysis",
      image: img3,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 bg-white px-[5%] py-4 flex justify-between items-center z-50 border-b border-gray-200">
        <div className="flex flex-row items-center gap-3 ">
          <img
            src={logoImage}
            alt="PulmoVision Logo"
            className="w-8 h-8 object-contain mb-2"
          />
          <div className="text-3xl font-bold text-[#1a78d2] tracking-tight">
            PulmoVision
          </div>
        </div>

        <div className="hidden lg:flex gap-10">
          <a
            href="#home"
            className="text-gray-600 font-medium hover:text-[#1a78d2] transition-colors"
          >
            Home
          </a>
          <a
            href="#about"
            className="text-gray-600 font-medium hover:text-[#1a78d2] transition-colors"
          >
            About Us
          </a>
          <a
            href="#services"
            className="text-gray-600 font-medium hover:text-[#1a78d2] transition-colors"
          >
            Our Services
          </a>
          <a
            href="#contact"
            className="text-gray-600 font-medium hover:text-[#1a78d2] transition-colors"
          >
            Contact
          </a>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-3">
            <a
              href={`${import.meta.env.VITE_APP_BASE_URL}/login`}
              className="px-6 py-2.5 border-2 border-[#1a78d2] text-[#1a78d2] rounded-lg font-semibold hover:bg-[#1a78d2] hover:text-white transition-all inline-block text-center"
            >
              Login
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION WITH SLIDESHOW */}
      <section className="px-[5%] pt-6 md:px-[10%] pb-10 md:pb-20">
        <h1
          id="home"
          className="text-4xl text-center md:text-6xl font-bold text-[#1a78d2] mb-2"
        >
          PulmoVision
        </h1>
        <h3 className="text-xl text-center md:text-2xl text-gray-600 mb-8">
          Vision for Healthier Lungs
        </h3>

        {/* Grid container with text on left and slideshow on right */}
        <div className=" grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center border border-gray-200 rounded-3xl p-6 md:p-10">
          {/* Text on the left */}
          <div className="space-y-4 md:space-y-6">
            <h5 className="text-lg md:text-xl font-semibold text-gray-700">
              Helping doctors catch intricacies for faster, smarter decisions
            </h5>
            <p className="text-base text-gray-600 leading-relaxed">
              PulmoVision connects field workers and medical experts through
              intelligent diagnostics. With just an X-ray, our AI analyzes,
              classifies, and helps detect TB and Pneumonia accurately. Built
              for rural outreach and modern healthcare.
            </p>
          </div>

          {/* Slideshow on the right */}
          <div className="relative w-full">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
              {/* Slideshow container */}
              <div className="relative h-[300px] md:h-[300px] lg:h-[300px]">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.caption}
                      className="w-full h-full object-contain p-6 md:p-8"
                    />
                    <div className="absolute bottom-0 left-0 right-0 -4 md:p-6">
                      <p className="text-white text-sm md:text-base lg:text-lg font-medium text-center">
                        {slide.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation dots */}
              <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-white w-6 md:w-8"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        id="about"
        className="px-[5%] py-20 bg-[#f0f8ff] flex flex-col items-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-[#1a78d2] mb-8 text-center">
          About Us
        </h2>

        <div className="max-w-5xl w-full bg-white border border-gray-200 rounded-3xl p-10 md:p-12">
          <p className="text-lg text-gray-600 leading-relaxed mb-6 text-justify">
            PulmoVision is an AI-powered diagnostic platform designed to assist
            healthcare professionals in the early and accurate detection of
            tuberculosis and pneumonia through chest X-ray analysis. By
            leveraging deep learning models and intelligent automation,
            PulmoVision enhances diagnostic precision, particularly in
            underserved or remote areas where access to medical expertise is
            limited.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed text-justify">
            The system supports both mobile and web applications, enabling
            seamless collaboration between health workers in the field and
            doctors in hospitals. PulmoVision not only streamlines clinical
            workflows but also ensures faster case review, real-time
            notifications, and interpretable medical reports — making it a
            reliable, scalable, and impactful solution for modern lung
            healthcare.
          </p>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="px-[5%] py-20 bg-white">
        <h2 className="text-4xl md:text-5xl font-bold text-[#1a78d2] text-center mb-16">
          Our Services
        </h2>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-8 bg-white rounded-3xl border border-gray-200 hover:-translate-y-3 hover:border-[#1a78d2] transition-all"
            >
              <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-6 flex items-center justify-center p-4 overflow-hidden mx-auto">
                <img
                  src={service.image}
                  alt={service.description}
                  className="w-full h-full object-cover scale-90"
                />
              </div>
              <p className="text-base text-gray-600 leading-relaxed text-center">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="px-[5%] py-20 bg-[#1a78d2]">
        <div className="max-w-6xl mx-auto flex justify-center items-stretch gap-2">
          {stats.map((stat, index) => (
            <React.Fragment key={index}>
              <div className="text-center flex-1 text-white">
                <div className="text-4xl md:text-5xl font-extrabold mb-2">
                  {stat.number}
                </div>
                <div className="text-base md:text-lg font-medium">
                  {stat.label}
                </div>
              </div>
              {index < stats.length - 1 && (
                <div className="w-px bg-white/30 h-[70%] self-center"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="px-[5%] py-10 border-t border-gray-200">
        <h3 className="text-2xl font-bold text-[#1a78d2] mb-8 text-center">
          Contact Us
        </h3>
        <div className="flex flex-wrap align-middle flex-row justify-center gap-6 text-gray-600 text-sm">
          <div
            className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors hover:cursor-pointer"
            onClick={() => {}}
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgba(20, 110, 190, 1.00)"
                d="M512 96L127.9 96C110.3 96 96 110.5 96 128.3L96 511.7C96 529.5 110.3 544 127.9 544L512 544C529.6 544 544 529.5 544 511.7L544 128.3C544 110.5 529.6 96 512 96zM231.4 480L165 480L165 266.2L231.5 266.2L231.5 480L231.4 480zM198.2 160C219.5 160 236.7 177.2 236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160zM480.3 480L413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480z"
              />
            </svg>
            <p>Shahzaib Munir</p>
          </div>
          <div
            className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors hover:cursor-pointer"
            onClick={() => {
              window.open(
                "https://www.linkedin.com/in/warda-tayyeb-027602234/",
                "_blank",
              );
            }}
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgba(20, 110, 190, 1.00)"
                d="M512 96L127.9 96C110.3 96 96 110.5 96 128.3L96 511.7C96 529.5 110.3 544 127.9 544L512 544C529.6 544 544 529.5 544 511.7L544 128.3C544 110.5 529.6 96 512 96zM231.4 480L165 480L165 266.2L231.5 266.2L231.5 480L231.4 480zM198.2 160C219.5 160 236.7 177.2 236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160zM480.3 480L413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480z"
              />
            </svg>
            <p>Warda Tayyeb</p>
          </div>

          <div
            className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors hover:cursor-pointer"
            onClick={() => {
              window.open(
                "https://www.linkedin.com/in/junaid-iftikhar-023383287/",
                "_blank",
              );
            }}
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
            >
              <path
                fill="rgba(20, 110, 190, 1.00)"
                d="M512 96L127.9 96C110.3 96 96 110.5 96 128.3L96 511.7C96 529.5 110.3 544 127.9 544L512 544C529.6 544 544 529.5 544 511.7L544 128.3C544 110.5 529.6 96 512 96zM231.4 480L165 480L165 266.2L231.5 266.2L231.5 480L231.4 480zM198.2 160C219.5 160 236.7 177.2 236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160zM480.3 480L413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480z"
              />
            </svg>
            <p>Junaid Iftikhar</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          CUST 2026 PulmoVision. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default PulmoVisionHomepage;
