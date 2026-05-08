export type DreamCategory = "short" | "medium" | "long";

export interface Dream {
  id: string;
  name: string;
  category: DreamCategory;
  amount: number;
  deadlineYears: number;
  priority: 1 | 2 | 3;
  why: string;
  saved: number;
  emoji: string;
}

export interface Debt {
  id: string;
  name: string;
  type: "Bank" | "Personal" | "Friend" | "Credit Card" | "Other";
  amount: number;
  emi: number;
  interest: number;
  stress: 1 | 2 | 3 | 4 | 5;
}

export interface OtherGoal {
  id: string;
  title: string;
  category: string;
  amount: number;
  priority: 1 | 2 | 3;
}

export interface UserProfile {
  fullName: string;
  nickname: string;
  city: string;
  age: number | "";
  monthlyIncome: number | "";
  savings: number | "";
  retirementAge: number | "";
  motivation: string;
  onboarded: boolean;
}

export const defaultProfile: UserProfile = {
  fullName: "",
  nickname: "",
  city: "",
  age: "",
  monthlyIncome: "",
  savings: "",
  retirementAge: "",
  motivation: "",
  onboarded: false,
};
