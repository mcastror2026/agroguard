import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonRiskIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-pulse"
    >
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-12 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
    </motion.div>
  );
}

export function SkeletonTodaySummary() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 animate-pulse"
    >
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function SkeletonFrostForecast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 animate-pulse"
    >
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>

      {/* Mobile Cards Skeleton */}
      <div className="md:hidden space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </motion.div>
  );
}

export function SkeletonWeatherForecast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 animate-pulse"
    >
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="overflow-x-auto">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
