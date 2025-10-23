"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

// You can define a new color palette for a hardware store look
const hardwareColors = {
  primary: {
    orange: "#f97316", // Orange-500
    gray: "#374151", // Gray-700
    darkGray: "#1f2937", // Gray-800
    lightGray: "#e5e7eb", // Gray-200
  },
  accent: {
    blue: "#2563eb",
    green: "#16a34a",
    red: "#dc2626",
  },
  background: {
    gradient: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%)",
  },
};

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
            color: hardwareColors.accent.blue,
            transition: { duration: 0.3 },
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

// 3D Card component with hover effects (this component is now slightly simplified)
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
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

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
        scale: isHovered ? 1.03 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative"
        animate={{
          z: isHovered ? 40 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Floating particles component (with new colors)
const FloatingParticles = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const particleCount =
    typeof window !== "undefined" && window.innerWidth < 768 ? 8 : 16;
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
          className="absolute w-1 h-1 sm:w-2 sm:h-2 rounded-full opacity-20"
          style={{
            background: `linear-gradient(45deg, ${hardwareColors.accent.blue}, ${hardwareColors.accent.red})`,
          }}
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          animate={{
            y: [null, -120, null],
            x: [null, Math.random() * 120 - 60, null],
            scale: [1, 1.8, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Category Icon Component (SVG-based)
const CategoryIcon = ({ type, className = "" }) => {
  const icons = {
    tools: (
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className={`w-full h-full ${className}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.rect
          x="10"
          y="20"
          width="60"
          height="40"
          fill="#4b5563" // Dark gray for the toolbox
          rx="8"
          initial={{ height: 0, y: 60 }}
          animate={{ height: 40, y: 20 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.rect
          x="30"
          y="15"
          width="20"
          height="5"
          fill="#374151" // Handle
          rx="2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
        <motion.path
          d="M 25 35 L 55 35 L 50 55 L 30 55 Z"
          fill="#f97316" // Orange for a wrench or hammer head
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        />
      </motion.svg>
    ),
    fasteners: (
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className={`w-full h-full ${className}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.circle
          cx="40"
          cy="40"
          r="20"
          stroke="#4b5563"
          strokeWidth="3"
          fill="none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.line
          x1="40"
          y1="20"
          x2="40"
          y2="60"
          stroke="#4b5563"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
        <motion.line
          x1="20"
          y1="40"
          x2="60"
          y2="40"
          stroke="#4b5563"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        />
        <motion.circle
          cx="40"
          cy="40"
          r="5"
          fill="#f97316"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        />
      </motion.svg>
    ),
    pipes: (
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className={`w-full h-full ${className}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.rect
          x="15"
          y="25"
          width="50"
          height="15"
          fill="#6b7280"
          rx="4"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.rect
          x="30"
          y="40"
          width="40"
          height="15"
          fill="#9ca3af"
          rx="4"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        />
      </motion.svg>
    ),
    building: (
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className={`w-full h-full ${className}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.rect
          x="20"
          y="30"
          width="40"
          height="30"
          fill="#f97316" // Orange for brick
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.line
          x1="20"
          y1="40"
          x2="60"
          y2="40"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        />
        <motion.line
          x1="20"
          y1="50"
          x2="60"
          y2="50"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        />
        <motion.polygon
          points="40,15 65,30 15,30"
          fill="#6b7280" // Gray for roof
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        />
      </motion.svg>
    ),
    electrical: (
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className={`w-full h-full ${className}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.path
          d="M40,20 L40,60 M20,40 L60,40 M30,30 L50,50 M30,50 L50,30"
          stroke="#f97316"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
        <motion.circle
          cx="40"
          cy="40"
          r="10"
          stroke="#f97316"
          strokeWidth="3"
          fill="none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        />
      </motion.svg>
    ),
    paints: (
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className={`w-full h-full ${className}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.rect
          x="20"
          y="25"
          width="40"
          height="40"
          fill="#94a3b8" // Paint can base
          rx="5"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.path
          d="M25,25 L25,20 C25,15 30,15 40,15 C50,15 55,15 55,20 L55,25"
          stroke="#4b5563" // Handle
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
        <motion.path
          d="M25,65 C30,68 50,68 55,65"
          stroke="#dc2626" // Red paint drip
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        />
      </motion.svg>
    ),
  };
  return icons[type] || icons.tools;
};

// Individual Service Card Component
// Individual Service Card Component
const ServiceCard = ({ service, index, isInView }) => {
  return (
    <Card3D className="h-full">
      <motion.div
        className="relative h-full bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-xl overflow-hidden group"
        initial={{ opacity: 0, y: 50, rotateX: 45 }}
        animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{
          duration: 0.8,
          delay: index * 0.2,
          type: "spring",
          stiffness: 100,
        }}
        whileHover={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          borderColor: hardwareColors.primary.orange,
        }}
      >
        {/* Animated background gradient */}
        {/* FIX: Change opacity to a semi-transparent value instead of 100% */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br from-gray-100/50 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        {/* Image or Icon container */}
        <div className="relative h-48 sm:h-56 flex items-center justify-center overflow-hidden">
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-40 h-40">
              <CategoryIcon type={service.iconType} />
            </div>
          )}

          {/* Service category badge */}
          <motion.div
            className={`absolute top-4 left-4 px-3 py-1 bg-gray-800 text-white text-xs font-semibold rounded-full shadow-lg`}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
          >
            {service.category}
          </motion.div>
        </div>

        {/* Content */}
        {/* Ensure content is positioned relative to avoid being covered by the background overlay */}
        <div className="relative z-10 p-6 space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 + 0.8 }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors duration-300">
              {service.title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              {service.description}
            </p>
          </motion.div>

          {/* Call to action */}
          <motion.div
            className="pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 + 1.5 }}
          >
            <motion.button
              className={`w-full py-3 px-4 bg-gray-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 group/btn`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center justify-center">
                View Products
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </Card3D>
  );
};

// Main Component
export default function ServicesSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -50]);
  const y2 = useTransform(scrollY, [0, 500], [0, -25]);

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

  const categories = [
    {
      id: "fasteners",
      title: "Fasteners & Screws",
      category: "Essentials",
      description:
        "A comprehensive range of nuts, bolts, screws, and washers for every fixing and joining need.",
      iconType: "fasteners",
      image: "",
    },
    {
      id: "hand-tools",
      title: "Hand Tools",
      category: "Professional Grade",
      description:
        "Ergonomic and durable hand tools including wrenches, pliers, and screwdrivers for all projects.",
      iconType: "tools",
      image: "",
    },
    {
      id: "power-tools",
      title: "Power Tools",
      category: "High Performance",
      description:
        "Powerful and reliable drills, saws, grinders, and more to tackle any construction or DIY task.",
      iconType: "electrical",
      image: "",
    },
    {
      id: "building-materials",
      title: "Building Materials",
      category: "Construction",
      description:
        "Everything from cement and rebar to plywood and bricks for strong, reliable structures.",
      iconType: "building",
      image: "",
    },
    {
      id: "pipes-fittings",
      title: "Pipes & Fittings",
      category: "Plumbing",
      description:
        "A wide selection of pipes, valves, and fittings for all your plumbing and drainage needs.",
      iconType: "pipes",
      image: "",
    },
    {
      id: "paints-chemicals",
      title: "Paints & Chemicals",
      category: "Finishing",
      description:
        "High-quality paints, sealants, adhesives, and other chemicals for a perfect finish.",
      iconType: "paints",
      image: "",
    },
  ];

  const backgroundStyle = {
    background: isMobile
      ? hardwareColors.background.gradient
      : `radial-gradient(circle at ${mousePosition.x * 100}% ${
          mousePosition.y * 100
        }%, 
      rgba(249, 115, 22, 0.08) 0%, 
      rgba(220, 38, 38, 0.05) 25%, 
      rgba(34, 197, 94, 0.03) 50%, 
      transparent 70%),
      ${hardwareColors.background.gradient}`,
  };

  return (
    <motion.section
      ref={containerRef}
      id="services"
      className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 overflow-hidden"
      onMouseMove={handleMouseMove}
      style={backgroundStyle}
    >
      {/* Animated Background Elements */}
      <FloatingParticles />

      {/* Geometric shapes in background - hidden on mobile for performance */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 border-2 rounded-full"
            style={{ borderColor: `${hardwareColors.accent.blue}40` }}
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{
              rotate: { duration: 30, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.div
            className="absolute bottom-40 right-32 w-20 h-20 rounded-xl backdrop-blur-sm rotate-45"
            style={{
              background: `linear-gradient(45deg, ${hardwareColors.accent.red}40, ${hardwareColors.accent.orange}40)`,
            }}
            animate={{ rotate: [45, 135, 45], y: [-15, 15, -15] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-800 mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Our Product Categories
        </motion.h2>

        <motion.p
          className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Browse our extensive selection of high-quality hardware products for
          every project, big or small.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
