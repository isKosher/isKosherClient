"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { KosherSupervisor } from "@/types";

type KosherSupervisorsListProps = {
  supervisors: KosherSupervisor[];
};

const KosherSupervisorsList: React.FC<KosherSupervisorsListProps> = ({ supervisors }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {supervisors.map((supervisor) => (
        <Card key={supervisor.id} className="border-sky-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-md text-[#1A365D]">{supervisor.name}</CardTitle>
            <CardDescription>{supervisor.authority}</CardDescription>
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
