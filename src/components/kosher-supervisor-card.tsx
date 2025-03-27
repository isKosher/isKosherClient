"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, ChevronLeft, ChevronRight, Award } from "lucide-react";
import { KosherSupervisor } from "@/types";

type KosherSupervisorsCardProps = {
  supervisors: KosherSupervisor[];
};

const KosherSupervisorsCard: React.FC<KosherSupervisorsCardProps> = ({ supervisors }) => {
  const [currentSupervisorIndex, setCurrentSupervisorIndex] = useState(0);
  const currentSuper = supervisors[currentSupervisorIndex];

  // Navigation handlers
  const handleNextSupervisor = () => {
    setCurrentSupervisorIndex((prev) => (prev + 1) % Math.max(1, supervisors.length));
  };

  const handlePrevSupervisor = () => {
    setCurrentSupervisorIndex((prev) => (prev > 0 ? prev - 1 : supervisors.length - 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-xl border border-blue-50 mb-6"
    >
      <div className="p-6 space-y-4">
        {/* Supervisor Section */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">פרטי המשגיח</h4>
          {supervisors.length > 1 && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevSupervisor}>
                <ChevronRight size={18} />
              </Button>
              <span className="text-xs text-gray-500">
                {currentSupervisorIndex + 1} / {supervisors.length}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNextSupervisor}>
                <ChevronLeft size={18} />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-blue-100 text-[#1A365D]">
            <AvatarImage
              src="https://lh3.googleusercontent.com/d/1mBGdKNPdaelz6mgm6SBFUXzefP16mrWn=w1000"
              alt={"supervisor"}
            />
            <AvatarFallback>{currentSuper.name?.charAt(0) || <Award />}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <p className="font-medium">{currentSuper.name || "N/A"}</p>
            <p className="text-sm text-gray-500">{currentSuper.authority || "N/A"}</p>
          </div>
          {currentSuper.contact_info && (
            <Button
              variant="ghost"
              size="icon"
              className="text-[#1A365D]"
              onClick={() => window.open(`tel:${currentSuper.contact_info}`, "_self")}
            >
              <Phone size={18} />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default KosherSupervisorsCard;
