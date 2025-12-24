import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const TimelineCard = ({ job, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative pl-8 md:pl-0 mb-12 flex flex-col md:flex-row gap-4 md:gap-8 items-start group timeline-card`}
    >
      {/* Date - Left Side Desktop */}
      <div className="md:w-1/3 md:text-right md:pr-8 md:pt-1">
        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
          {job.date}
        </span>
      </div>

      {/* Timeline Node */}
      <div className="hidden md:block absolute left-[33.333%] top-2 w-4 h-4 rounded-full border-2 border-indigo-600 bg-white dark:bg-zinc-900 z-10 transform -translate-x-1/2 transition-colors duration-300 group-hover:bg-indigo-600 box-content shadow-[0_0_0_4px_rgba(255,255,255,1)] dark:shadow-[0_0_0_4px_rgba(9,9,11,1)]"></div>
      {/* Mobile Timeline Node */}
      <div className="md:hidden absolute left-0 top-2 w-3 h-3 rounded-full bg-indigo-600 border border-white dark:border-zinc-900 ring-4 ring-white dark:ring-zinc-900"></div>


      {/* Content Card - Right Side Desktop */}
      <div className={`md:w-2/3 p-6 rounded-xl border transition-all duration-300 ${isInView
          ? 'border-indigo-500/50 dark:border-indigo-400/50 bg-white dark:bg-zinc-900 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20'
          : 'border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:border-gray-200 dark:hover:border-zinc-700'
        }`}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {job.role}
        </h3>
        <h4 className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mb-4">
          {job.company}
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed whitespace-pre-line">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {job.stack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 border border-gray-200 dark:border-zinc-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function ResumeTimeline({ data }) {
  return (
    <div className="relative py-12">
      {/* Vertical Line */}
      <div className="absolute left-[7px] md:left-1/3 top-4 bottom-0 w-0.5 bg-gray-200 dark:bg-zinc-800 transform md:-translate-x-1/2"></div>

      <div className="space-y-4">
        {data.map((job, index) => (
          <TimelineCard key={index} job={job} index={index} />
        ))}
      </div>
    </div>
  );
}
