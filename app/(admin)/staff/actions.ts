"use server";

import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Database } from "@/types/supabase";

type StaffRole = Database["public"]["Enums"]["staff_role"];

export async function createStaffAccount(formData: FormData) {
  // 1. Validate requester
  const adminProfile = await requireRole(["admin"]);

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as StaffRole;
  const staffPin = formData.get("staffPin") as string;

  if (!firstName || !lastName || !email || !password || !role) {
    return { error: "All fields are required" };
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
    // 3. Create Profile linked to the admin's restaurant
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: userId,
        restaurant_id: adminProfile.restaurant_id, // Scope to same restaurant!
        full_name: `${firstName} ${lastName}`,
        email,
        role: role,
        staff_id: staffPin || null,
        is_active: true,
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
