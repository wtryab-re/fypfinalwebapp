import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import images from assets folder
import service1Img from "./assets/service-1stimg.png";
import service2Img from "./assets/lung-inspection.png";
import service3Img from "./assets/lung-image.png";
import logoImage from "./assets/logo.png";

const PulmoVisionHomepage = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Statistics data
    const stats = [
        { number: "99%", label: "Positive Feedback" },
        { number: "1000+", label: "Active Health Workers" },
        { number: "24/7", label: "AI-Powered System Running" },
    ];

    // Services data with images
    const services = [
        {
            // title: "Early detection of TB and Pneumonia",
            description: "Emporweing Diagnosis with the Precision of AI",
            image: service1Img
        },
        {
            // title: "X-ray powered insights",
            description: "Early detection of TB and Pneumonia",
            image: service2Img
        },
        {
            // title: "Empowering Diagnosis with the Precision of AI",
            description: "X-ray powered insights for smarter lung analysis",
            image: service3Img
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* COMPONENT 1: NAVBAR */}
            <nav className="sticky top-0 bg-gradient-to-r from-white to-blue-50 px-[5%] py-4 flex justify-between items-center shadow-sm z-50 border-b border-blue-100">
                <div className="flex flex-col">
                    <div className="text-3xl font-bold text-blue-600 tracking-tight">
                        PulmoVision
                    </div>
                    <div className="text-xs text-gray-500 -mt-1">
                        Vision for Healthier Lungs
                    </div>
                </div>

                <div className="hidden lg:flex gap-10">
                    <a
                        href="#home"
                        className="text-gray-600 font-medium hover:text-blue-600 transition-colors"
                    >
                        Home
                    </a>
                    <a
                        href="#about"
                        className="text-gray-600 font-medium hover:text-blue-600 transition-colors"
                    >
                        About Us
                    </a>
                    <a
                        href="#services"
                        className="text-gray-600 font-medium hover:text-blue-600 transition-colors"
                    >
                        Our Services
                    </a>
                    <a
                        href="#contact"
                        className="text-gray-600 font-medium hover:text-blue-600 transition-colors"
                    >
                        Contact
                    </a>
                    <a
                        href="http://localhost:8080/cases"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 font-medium hover:text-blue-600 transition-colors"
                    >
                        AI Dashboard
                    </a>


                </div>

                <div className="flex items-center gap-6">
                    <div className="relative">

                    </div>
                    <div className="flex gap-3">
                        <a
                            href={`${import.meta.env.VITE_APP_BASE_URL}/login`}
                            className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all inline-block text-center"
                        >
                            Login
                        </a>
                    </div>
                </div>
            </nav>

            {/* COMPONENT 2: HERO SECTION */}
            <section
                id="home"
                className="px-[10%] py-24 md:py-32 grid md:grid-cols-2 gap-16 items-center"
            >
                <div>
                    <h1 className="text-3xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent leading-tight ">
                        PulmoVision
                    </h1>
                    <h3 className="md:text-2xl text-blue-500">Vision for Healthier Lungs</h3>
                    <br />
                    <div className="max-w-5xl w-full bg-gray-50 border border-gray-200 rounded-3xl p-12 shadow-[8px_8px_20px_rgba(0,0,0,0.06)]">
                        <h5 className="text-lg font-semibold text-gray-500">Helping doctors make faster, smarter decisions</h5>
                        <p className="text-md text-gray-500 mb-10 leading-relaxed">
                            PulmoVision connects field workers and medical experts through
                            intelligent diagnostics. With just an X-ray, our AI analyzes,
                            classifies, and helps detect TB and Pneumonia accurately. Built for
                            rural outreach and modern healthcare.
                        </p>
                    </div>
                </div>
                <div className="h-96 md:h-[450px] rounded-3xl flex items-center justify-center relative overflow-hidden">
                    {/* Logo image placed in hero section */}
                    <img
                        src={logoImage}
                        alt="PulmoVision Logo"
                        className="w-4/5 h-4/5 object-contain opacity-90"
                    />
                    <div className="absolute w-72 h-72 bg-gradient-radial from-blue-600/10 to-transparent rounded-full"></div>
                </div>
            </section>



            {/* COMPONENT 4: ABOUT SECTION */}
            <section
                id="about"
                className="px-[5%] py-24 bg-gradient-to-r from-blue-50/50 to-blue-100/30 flex flex-col items-center"
            >
                <h2 className="text-5xl font-bold text-blue-800 mb-8 text-center">
                    About Us
                </h2>

                <div className="max-w-5xl w-full bg-gray-50 border border-gray-200 rounded-3xl p-12 shadow-[8px_8px_20px_rgba(0,0,0,0.06)] hover:shadow-[12px_12px_25px_rgba(0,0,0,0.08)] transition-shadow">
                    <p className="text-lg text-gray-500 leading-relaxed mb-6 text-justify">
                        <b className="text-gray-500">PulmoVision is an AI-powered diagnostic platform designed to assist healthcare
                            professionals in the early and accurate detection of tuberculosis and pneumonia through
                            chest X-ray analysis. </b>
                        By leveraging deep learning models and intelligent automation,
                        PulmoVision enhances diagnostic precision, particularly in underserved or remote areas
                        where access to medical expertise is limited.
                    </p>
                    <p className="text-lg text-gray-500 leading-relaxed text-justify">
                        <b className="text-gray-500">The system supports both mobile and web applications, enabling
                            seamless collaboration between health workers in the field and
                            doctors in hospitals. </b> PulmoVision not only streamlines clinical
                        workflows but also ensures faster case review, real-time
                        notifications, and interpretable medical reports — making it a
                        reliable, scalable, and impactful solution for modern lung
                        healthcare.
                    </p>
                </div>
            </section>

            {/* COMPONENT 5: SERVICES SECTION */}
            <section id="services" className="px-[5%] py-24 bg-white">
                <h2 className="text-5xl font-bold text-gray-800 text-center mb-16">
                    Our Services
                </h2>
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border border-gray-200 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-600/12 hover:border-blue-600 transition-all"
                        >
                            <div className="w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl mb-6 flex items-center justify-center p-4 overflow-hidden mx-auto">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-contain scale-90"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                                {service.title}
                            </h3>
                            <p className="text-base text-gray-600 leading-relaxed text-center">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* COMPONENT 3: STATISTICS SECTION */}
            <section className="px-[5%] py-20 bg-blue-600">
                <div className="max-w-6xl mx-auto flex justify-center items-stretch gap-2">
                    {stats.map((stat, index) => (
                        <React.Fragment key={index}>
                            <div className="text-center flex-1 text-white">
                                <div className="text-5xl font-extrabold mb-2">{stat.number}</div>
                                <div className="text-lg font-medium">{stat.label}</div>
                            </div>
                            {index < stats.length - 1 && (
                                <div className="w-px bg-gray-300 h-[70%] self-center"></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* COMPONENT 6: FOOTER */}
            <footer
                id="contact"
                className="  px-[5%] py-16"
            >
                <h2 className="text-5xl font-bold text-blue-800 mb-12 text-center">
                    Contact Us
                </h2>
                <div className="grid md:grid-cols-4 gap-8 mb-12">

                    <div>
                        <h3 className="text-3xl text-blue-600 font-bold mb-5">
                            PulmoVision
                        </h3>
                        <p className="mb-3 text-gray-500">
                            <p> E-9 Islamabad, PC 4281 </p>
                        </p>
                        <p className="mb-6">
                            <p className="text-blue-600"><b>Call:</b> (051) 123 456 xxx</p>
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg text-blue-600 font-bold mb-6">
                            Explore
                        </h4>
                        <a
                            href="#features"
                            className="block text-gray-500 hover:text-blue-600 mb-3 transition-colors"
                        >
                            Feature
                        </a>
                        <a
                            href="#about"
                            className="block text-gray-500 hover:text-blue-600 mb-3 transition-colors"
                        >
                            About Us
                        </a>
                        <a
                            href="#faq"
                            className="block text-gray-500 hover:text-blue-600 mb-3 transition-colors"
                        >
                            FAQs
                        </a>
                        <a
                            href="#contact"
                            className="block text-gray-500 hover:text-blue-600 mb-3 transition-colors"
                        >
                            Contact
                        </a>
                    </div>

                    <div>
                        <h4 className="text-lg text-blue-600  font-bold mb-6">
                            Legal
                        </h4>
                        <a
                            href="#help"
                            className="block text-gray-500 hover:text-blue-600 mb-3 transition-colors"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#legal"
                            className="block text-gray-500 hover:text-blue-600 mb-3 transition-colors"
                        >
                            Terms of Services
                        </a>
                        <a
                            href="#legal"
                            className="block text-gray-500 hover:text-blue-600 mb-3 transition-colors"
                        >
                            Documentations
                        </a>
                        <a
                            href="#legal"
                            className="block text-gray-500 hover:text-blue-600 mb-3 transition-colors"
                        >
                            Help Center
                        </a>
                    </div>

                    <div>
                        <h4 className="text-lg text-blue-600  font-bold mb-6">
                            Subscribe
                        </h4>


                        <div>
                            <p className="mb-4 text-gray-500">Subscribe to get the latest news from us</p>
                            <form className="flex flex-col sm:flex-row sm:items-stretch">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="w-full px-5 py-3 border bg-blue-100 text-black rounded-full focus:outline-none  transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-cyan-400 text-white rounded-full font-semibold sm:-ml-12 z-10 relative hover:bg-cyan-500 transition-all shadow-md"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © 2025 PulmoVision, All Rights Reserved
                    </p>
                    <div className="flex flex-col sm:flex-row gap-8">
                        <a
                            href="#privacy"
                            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#terms"
                            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            Terms of Services
                        </a>
                        <a
                            href="#accessibility"
                            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            Accessibility
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PulmoVisionHomepage;