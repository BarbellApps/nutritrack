"use client";

import { Moon, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsRow } from "./SettingsRow";
import { DarkModeToggle } from "./DarkModeToggle";
import { signOut } from "@/app/(auth)/actions";

export function PreferencesCard() {
  return (
    <Card>
      <CardContent className="flex flex-col divide-y divide-border pt-2">
        <SettingsRow icon={<Moon className="size-4" />} label="Dark Mode" colorVar="--chart-4">
          <DarkModeToggle />
        </SettingsRow>
      </CardContent>
      <div className="px-4 pt-2">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-destructive"
          >
            <LogOut className="size-4" />
            Log Out
          </button>
        </form>
      </div>
    </Card>
  );
}
