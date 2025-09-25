import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full"></div>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Gamepad2 className="h-6 w-6 text-primary-500" />
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          جاري تحميل الألعاب...
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          يرجى الانتظار قليلاً
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingSpinner;



