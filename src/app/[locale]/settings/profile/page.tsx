"use client";

import { useState } from "react";
import SectionCard from "@/components/custom/SectionCard";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown } from "lucide-react";
import UserPrefrence from "../../../../../userpreference"; // ✅ mock import

import HeaderBar from "@/app/Components/reusable/nameconversion/PageHeader";

export default function ProfilePage() {
  const userPrefData = UserPrefrence.data; // ✅ your mock user preferences

  // directly use mock values as defaults
  const [selectedTimeZone, setSelectedTimeZone] = useState(
    userPrefData.timeZone
  );
  const [selectedDateFormat, setSelectedDateFormat] = useState(
    userPrefData.dateFormat
  );
  const [selectedTimeFormat, setSelectedTimeFormat] = useState(
    userPrefData.timeFormat
  );

  // Dropdown options from userpreference.tsx mock data
  const timeZoneOptions = userPrefData.timeZoneOptions;
  const dateFormatOptions = userPrefData.dateFormatOptions;
  const timeFormatOptions = userPrefData.timeFormatOptions;

  return (
    <>
      <HeaderBar title="Profile Settings" icon={<User className="w-6 h-6" />} />

      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <SectionCard title="User Preferences">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Time Zone */}
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone *</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">{selectedTimeZone}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {timeZoneOptions.map(option => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setSelectedTimeZone(option.label)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Date Format */}
                <div className="space-y-2">
                  <Label htmlFor="dateformat">Date Display Format *</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">{selectedDateFormat}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {dateFormatOptions.map(option => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setSelectedDateFormat(option.label)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Time Format */}
                <div className="space-y-2">
                  <Label htmlFor="timeformat">Time Format *</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">{selectedTimeFormat}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {timeFormatOptions.map(option => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setSelectedTimeFormat(option.label)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </main>
    </>
  );
}
