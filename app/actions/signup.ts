"use server";

import { redirect } from "next/navigation";
import { registerUser } from "@/lib/api";

export async function signup(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const result = await registerUser(email, password);

  if (result.error) {
    return { error: result.error };
  }

  redirect("/login");
}
