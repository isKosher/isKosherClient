"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { KosherSupervisor } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Award } from "lucide-react";
import { AVATAR_SUPERVISOR_URL } from "@/lib/constants";

type KosherSupervisorsListProps = {
  supervisors: KosherSupervisor[];
};

const KosherSupervisorsList: React.FC<KosherSupervisorsListProps> = ({ supervisors }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {supervisors.map((supervisor) => (
        <Card key={supervisor.id} className="border-sky-100">
          <CardHeader className="pb-2 flex flex-row items-center gap-3">
            <Avatar className="h-10 w-10 bg-blue-100 text-[#1A365D]">
              <AvatarImage src={AVATAR_SUPERVISOR_URL} alt={"supervisor"} />
              <AvatarFallback>{supervisor.name?.charAt(0) || <Award />}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-md text-[#1A365D]">{supervisor.name}</CardTitle>
              <CardDescription>{supervisor.authority}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-[#2D4A6D] font-medium">טלפון:</span>
                <span dir="ltr">{supervisor.contact_info || "אין מידע"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KosherSupervisorsList;
