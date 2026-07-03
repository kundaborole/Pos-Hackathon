"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Database } from "@/types/supabase";

type StaffRole = Database["public"]["Enums"]["staff_role"];

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check profile active status and role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "No staff profile found for this account." };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return { error: "This account has been deactivated." };
  }

  return { success: true, role: profile.role as StaffRole };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/staff-login");
}

export async function signupOwnerAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const restaurantName = formData.get("restaurantName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstName || !lastName || !restaurantName || !email || !password) {
    return { error: "All fields are required" };
  }

  const adminClient = createAdminClient();

  // 1. Create Auth User server-side (Bypasses sign-up rate limits, auto-confirms)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create user account" };
  }

  const userId = authData.user.id;

  try {
    // 2. Create Restaurant
    const { data: restaurantData, error: restaurantError } = await adminClient
      .from("restaurants")
      .insert({
        name: restaurantName,
      })
      .select("id")
      .single();

    if (restaurantError || !restaurantData) {
      throw new Error(restaurantError?.message || "Failed to create restaurant workspace");
    }

    const restaurantId = restaurantData.id;

    // 3. Create Admin Profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: userId,
        restaurant_id: restaurantId,
        full_name: `${firstName} ${lastName}`,
        email,
        role: "admin",
        is_active: true,
      });

    if (profileError) {
      throw new Error(profileError.message || "Failed to create admin profile");
    }

    // Since we created the user via Admin API, we need to log them in locally
    const supabase = await createClient();
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { success: true };
  } catch (err: unknown) {
    // 4. Rollback Auth User if creation failed
    await adminClient.auth.admin.deleteUser(userId);
    const message = err instanceof Error ? err.message : "An unexpected error occurred during setup.";
    return { error: message };
  }
}
