import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Heart, BarChart3, User, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { IntroWaveform } from '../animations/IntroWaveForm';

interface OnboardingSlidesProps {
  onComplete: () => void;
}

export const OnboardingSlides: React.FC<OnboardingSlidesProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Monitor Your Heart",
      subtitle: "Real-time ECG monitoring with advanced analysis",
      content: <IntroWaveform animated color="#ef4444" height={120} />,
      bgGradient: "from-red-50 to-red-100"
    },
    {
      title: "Analyze Your Health",
      subtitle: "Get comprehensive health insights and recommendations",
      content: (
        <div className="flex justify-center space-x-4">
          {[BarChart3].map((Icon, i) => (
            <motion.div
              key={i}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.3 }}
              className="w-24 h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center"
            >
              <Icon size={24} className="text-white" />
            </motion.div>
          ))}
        </div>
      ),
      bgGradient: "from-yellow-50 to-blue-100"
    },

    {
      title: "Manage Your Profile",
      subtitle: "Track lifestyle factors and medical history",
      content: (
        <div className="flex justify-center space-x-4">
          {[User, Heart, BarChart3].map((Icon, i) => (
            <motion.div
              key={i}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.3 }}
              className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center"
            >
              <Icon size={24} className="text-white" />
            </motion.div>
          ))}
        </div>
      ),
      bgGradient: "from-orange-50 to-purple-100"
    },
    {
      title: "Multi-User Support",
      subtitle: "Perfect for patients, clinics, and healthcare providers",
      content: (
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
          </div>
        </motion.div>
      ),
      bgGradient: "from-blue-50 to-green-100"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`h-full bg-gradient-to-br ${slides[currentSlide].bgGradient} flex items-center justify-center p-8`}
          >
            <div className="max-w-md text-center space-y-8">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slides[currentSlide].content}
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h2 className="text-3xl font-bold text-gray-800">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-lg text-gray-600">
                  {slides[currentSlide].subtitle}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="bg-white p-6 border-t border-gray-200">
        <div className="max-w-md mx-auto">
          {/* Progress indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {slides.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                  }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              icon={ChevronLeft}
            >
              Back
            </Button>

            <Button
              onClick={nextSlide}
              icon={currentSlide === slides.length - 1 ? undefined : ChevronRight}
            >
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};