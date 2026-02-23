"use client";

import { motion } from "motion/react";
import { usePlayer } from "@/features/player/context";
import { WorkoutCard } from "@/features/workouts/components/WorkoutCard";

const EASE = [0.23, 1, 0.32, 1] as const;

export default function WorkoutsPage(): React.ReactElement {
  const { player } = usePlayer();
  const sorted = [...player.workoutLog].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-5">
      <motion.p
        className="section-header"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        Session History
      </motion.p>

      <div className="space-y-3">
        {sorted.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.07, ease: EASE }}
          >
            <WorkoutCard entry={entry} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
