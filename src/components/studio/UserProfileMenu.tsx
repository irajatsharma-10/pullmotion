"use client";

import React from "react";
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { CreditCard, LogIn } from "lucide-react";
import { clerkAppearance } from "@/lib/clerk-theme";

interface UserProfileMenuProps {
  onOpenPricing?: () => void;
}

export function UserProfileMenu({ onOpenPricing }: UserProfileMenuProps) {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium border border-slate-200 dark:border-white/10 transition-colors cursor-pointer">
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-xs transition-all cursor-pointer">
            <span>Sign Up</span>
          </button>
        </SignUpButton>
      </Show>

      <Show when="signed-in">
        <UserButton
          appearance={{
            ...clerkAppearance,
            elements: {
              ...clerkAppearance.elements,
              avatarBox: "w-8 h-8 ring-2 ring-white/10 dark:ring-white/5",
            },
          }}
        >
          {onOpenPricing && (
            <UserButton.MenuItems>
              <UserButton.Action
                label="Subscription & Plans"
                labelIcon={<CreditCard className="w-4 h-4 text-indigo-400" />}
                onClick={onOpenPricing}
              />
            </UserButton.MenuItems>
          )}
        </UserButton>
      </Show>
    </div>
  );
}
