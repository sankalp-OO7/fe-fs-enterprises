"use client";
import { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";

// Animated text component for letter-by-letter animation
const AnimatedText = ({ text, className, delay = 0 }) => {
  const letters = text.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          variants={child}
          key={index}
          className="inline-block"
          whileHover={{
            scale: 1.1,
            color: "#0f766e", // Teal for hardware theme
            transition: { duration: 0.3 },
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Floating particles component with light theme
const FloatingParticles = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const particleCount =
    typeof window !== "undefined" && window.innerWidth < 768 ? 8 : 15;
  const particles = Array.from({ length: particleCount }, (_, i) => i);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (dimensions.width === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-r from-gray-400 to-slate-500 rounded-full opacity-20"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          animate={{
            y: [null, -100, null],
            x: [null, Math.random() * 100 - 50, null],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: Math.random() * 6 + 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// 3D Card component with hover effects
const Card3D = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    setMousePosition({ x: rotateY, y: rotateX });
  };

  return (
    <motion.div
      ref={ref}
      className={`transform-gpu perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      animate={{
        rotateX: isHovered ? mousePosition.y : 0,
        rotateY: isHovered ? mousePosition.x : 0,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative"
        animate={{
          z: isHovered ? 30 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Hardware Tools SVG Icon Component
const HardwareToolsIcon = () => (
  <motion.svg
    width="400"
    height="300"
    viewBox="0 0 400 300"
    className="w-full h-full"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    {/* Background gears */}
    <motion.circle
      cx="100"
      cy="100"
      r="40"
      fill="#e5e7eb"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, rotate: 360 }}
      transition={{ duration: 2, delay: 0.2, repeat: Infinity, ease: "linear" }}
    />
    <motion.circle
      cx="300"
      cy="200"
      r="30"
      fill="#d1d5db"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, rotate: -360 }}
      transition={{ duration: 2, delay: 0.4, repeat: Infinity, ease: "linear" }}
    />

    {/* Wrench */}
    <motion.path
      d="M150 150 L200 200 L250 150 Z"
      fill="#4b5563"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
    />
    <motion.rect
      x="200"
      y="180"
      width="100"
      height="20"
      fill="#4b5563"
      initial={{ width: 0 }}
      animate={{ width: 100 }}
      transition={{ duration: 1, delay: 0.8 }}
    />
    <motion.circle
      cx="200"
      cy="190"
      r="15"
      fill="#1f2937"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 1.2 }}
    />

    {/* Hammer */}
    <motion.path
      d="M50 200 L100 250 L150 200 L100 150 Z"
      fill="#9ca3af"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 1 }}
    />
    <motion.rect
      x="125"
      y="180"
      width="120"
      height="20"
      fill="#8b5cf6"
      initial={{ width: 0 }}
      animate={{ width: 120 }}
      transition={{ duration: 1, delay: 1 }}
    />

    {/* Screwdriver */}
    <motion.rect
      x="250"
      y="50"
      width="20"
      height="100"
      rx="10"
      fill="#3b82f6"
      initial={{ height: 0, y: 150 }}
      animate={{ height: 100, y: 50 }}
      transition={{ duration: 1, delay: 1.2 }}
    />
    <motion.rect
      x="255"
      y="150"
      width="10"
      height="20"
      rx="5"
      fill="#1f2937"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.5, delay: 1.7 }}
    />
  </motion.svg>
);

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -30]);
  const y2 = useTransform(scrollY, [0, 300], [0, -60]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.section
      ref={containerRef}
      id="hero"
      className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen gap-4 sm:gap-6 lg:gap-12 px-4 sm:px-6 py-8 sm:py-20 lg:py-24 overflow-hidden pt-25 sm:pt-0"
      onMouseMove={handleMouseMove}
      style={{
        background: isMobile
          ? `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #f1f5f9 100%)`
          : `radial-gradient(circle at ${mousePosition.x * 100}% ${
              mousePosition.y * 100
            }%, 
          rgba(100, 100, 100, 0.05) 0%, 
          rgba(150, 150, 150, 0.03) 25%, 
          rgba(190, 190, 190, 0.02) 50%, 
          transparent 70%),
          linear-gradient(135deg, 
          #f8fafc 0%, 
          #e2e8f0 25%, 
          #cbd5e1 50%, 
          #f1f5f9 100%)`,
      }}
    >
      {/* Animated Background Elements */}
      <FloatingParticles />

      {/* Geometric shapes in background - hidden on mobile for performance */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute top-10 sm:top-20 left-4 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 border-2 border-gray-300/40 rounded-full"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{ y: y1 }}
          />

          <motion.div
            className="absolute bottom-16 sm:bottom-32 right-4 sm:right-32 w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-r from-slate-100/60 to-gray-100/60 rounded-xl backdrop-blur-sm"
            animate={{
              rotate: -360,
              y: [-10, 10, -10],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{ y: y2 }}
          />

          <motion.div
            className="absolute top-1/3 right-1/4 w-8 h-8 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-200/40 to-orange-200/40 rounded-lg"
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}

      {/* Content Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center w-full h-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 z-10">
        {/* Left Content */}
        <motion.div
          className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-full lg:max-w-none mb-4 lg:mb-0"
          initial={{ opacity: 0, x: -100 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card3D className="w-full">
            <motion.div
              className="relative p-4 sm:p-6 lg:p-10 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl border border-gray-200/60 shadow-xl"
              whileHover={
                !isMobile
                  ? {
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                      borderColor: "rgba(100, 100, 100, 0.3)",
                    }
                  : {}
              }
            >
              {/* Company Badge */}
              <motion.div
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200/60 rounded-full text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
                Trusted Partner in Pune
              </motion.div>

              <AnimatedText
                text="FS Enterprises"
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 mb-2 sm:mb-3 lg:mb-4 leading-tight"
                delay={0.8}
              />

              <AnimatedText
                text="Your Wholesale Hardware Source"
                className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 mb-3 sm:mb-4 lg:mb-6 leading-tight"
                delay={1.5}
              />

              {/* Glowing underline */}
              <motion.div
                className="h-0.5 sm:h-1 bg-gradient-to-r from-gray-500 via-slate-500 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={isInView ? { width: "60%" } : {}}
                transition={{ duration: 1.2, delay: 2.2 }}
              />
            </motion.div>
          </Card3D>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 2.8 }}
            className="w-full mt-4 sm:mt-6 lg:mt-8"
          >
            <motion.p
              className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700 font-medium mb-3 sm:mb-4 leading-relaxed px-2 sm:px-0"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 3 }}
            >
              Supplying the finest quality{" "}
              <span className="font-bold text-teal-700">
                hardware, tools, and industrial supplies
              </span>
              to businesses and contractors across Pune.
            </motion.p>

            <motion.p
              className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600 leading-relaxed px-2 sm:px-0"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 3.3 }}
            >
              We are your one-stop solution for all your construction and
              manufacturing needs, providing durable products and reliable
              service.
            </motion.p>
          </motion.div>

          {/* Service Highlights */}
          <motion.div
            className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 mt-4 sm:mt-6 lg:mt-8 px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 3.6 }}
          >
            {[
              "Wholesale Tools",
              "Construction Materials",
              "Industrial Supplies",
            ].map((service, index) => (
              <motion.span
                key={service}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-700"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#f0fdf4", // Light green for highlight
                  borderColor: "#34d399", // Green
                  color: "#047857", // Darker green
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 3.8 + index * 0.1 }}
              >
                {service}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md mt-6 sm:mt-8 lg:mt-10 px-2 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 4.2 }}
          >
            <Link to="/products">
              <motion.button
                className="relative px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-gray-600 to-slate-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl overflow-hidden group shadow-lg"
                whileHover={
                  !isMobile
                    ? {
                        scale: 1.05,
                        boxShadow: "0 20px 40px -12px rgba(100, 100, 100, 0.4)",
                      }
                    : {}
                }
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection("products")}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center justify-center">
                  <span>Explore Products</span>
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </Link>

            <motion.button
              onClick={() => scrollToSection("services")}
              className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-gray-300 text-gray-700 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-300 group"
              whileHover={
                !isMobile
                  ? {
                      scale: 1.05,
                      borderColor: "#6b7280", // Gray
                      color: "#1f2937", // Dark Gray
                      backgroundColor: "#f9fafb",
                    }
                  : {
                      borderColor: "#6b7280",
                      color: "#1f2937",
                      backgroundColor: "#f9fafb",
                    }
              }
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center justify-center">
                Our Services
                <motion.span className="ml-2 transform group-hover:rotate-90 transition-transform duration-300">
                  ✦
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Content - Hardware Illustration */}
        <motion.div
          className="flex-1 flex items-center justify-center w-full lg:max-w-none mt-6 lg:mt-0"
          initial={{ opacity: 0, scale: 0.8, rotateY: isMobile ? 0 : 45 }}
          animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
          transition={{
            duration: 1.2,
            delay: 0.5,
            type: "spring",
            stiffness: 100,
          }}
        >
          <Card3D>
            <motion.div
              className="relative p-3 sm:p-6 lg:p-8 xl:p-10 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-100/80 shadow-2xl"
              animate={
                !isMobile
                  ? {
                      boxShadow: [
                        "0 25px 50px -12px rgba(100, 100, 100, 0.15)",
                        "0 25px 50px -12px rgba(150, 150, 150, 0.15)",
                        "0 25px 50px -12px rgba(100, 100, 100, 0.15)",
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="w-[240px] h-[180px] sm:w-[300px] sm:h-[220px] md:w-[350px] md:h-[260px] lg:w-[400px] lg:h-[300px] xl:w-[450px] xl:h-[350px]">
                <HardwareToolsIcon />
              </div>

              {/* Feature badges around the illustration */}
              <motion.div
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full text-xs font-semibold text-green-700"
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 2 }}
              >
                Quality ✓
              </motion.div>

              <motion.div
                className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700"
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 2.3 }}
              >
                Reliability ✓
              </motion.div>

              <motion.div
                className="absolute top-1/2 -left-2 sm:-left-4 px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-full text-xs font-semibold text-orange-700"
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 2.6 }}
              >
                Variety ✓
              </motion.div>
            </motion.div>
          </Card3D>
        </motion.div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      {!isMobile && (
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 5 }}
        >
          <motion.div
            className="flex flex-col items-center text-gray-500"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-xs sm:text-sm mb-2 font-medium">
              Explore More
            </span>
            <motion.div
              className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
              whileHover={{ borderColor: "#4b5563" }}
            >
              <motion.div
                className="w-1 h-3 bg-gray-400 rounded-full mt-2"
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Trust indicators */}
      <motion.div
        className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 lg:bottom-8 lg:right-8 flex items-center space-x-2 text-xs sm:text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 4.5 }}
      >
        <motion.div
          className="flex items-center space-x-1"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-yellow-500">⭐</span>
          <span className="font-medium">15+ Years</span>
        </motion.div>
        <span className="hidden sm:inline">•</span>
        <span className="font-medium hidden sm:inline">Wholesale Experts</span>
      </motion.div>
    </motion.section>
  );
}
