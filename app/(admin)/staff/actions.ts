"use server";

import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Database } from "@/types/supabase";

type StaffRole = Database["public"]["Enums"]["staff_role"];

export async function createStaffAccount(formData: FormData) {
  // 1. Validate requester
  const adminProfile = await requireRole(["admin"]);

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as StaffRole;
  const staffPin = formData.get("staffPin") as string;

  if (!fullName || !email || !password || !role) {
    const missing = [];
    if (!fullName) missing.push("fullName");
    if (!email) missing.push("email");
    if (!password) missing.push("password");
    if (!role) missing.push("role");
    return { error: `Missing required fields: ${missing.join(", ")}` };
  }

  const validRoles: StaffRole[] = ["admin", "cashier", "waiter", "kitchen"];
  if (!validRoles.includes(role)) {
    return { error: "Invalid role specified" };
  }

  const adminClient = createAdminClient();

  // 2. Create Auth User
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create staff account" };
  }

  const userId = authData.user.id;

  try {
    // 3. Create Profile
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: authData.user.id,
      restaurant_id: adminProfile.restaurant_id,
      full_name: fullName,
      email: email,
      staff_id: staffPin?.trim() ? staffPin.trim() : null,
      role: role,
      is_active: true
    });

    if (profileError) {
      throw new Error(profileError.message || "Failed to create staff profile");
    }

    return { success: true };
  } catch (err: unknown) {
    // Rollback if profile creation fails
    await adminClient.auth.admin.deleteUser(userId);
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }
}
