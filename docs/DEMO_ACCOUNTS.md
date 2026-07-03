# Cafe Hub: Demo Accounts Guide

For the hackathon demonstration, you will need a robust set of accounts representing each operational role in the restaurant. This document outlines how to safely create and link these accounts without hardcoding credentials.

## Step 1: Create the Restaurant Owner (Admin)
Since we have strict security policies, you cannot arbitrarily insert users into the database. You must use the UI to establish the first admin account.

1. Navigate to `/signup`.
2. Fill out your details (e.g., "Jane", "Doe", "Cafe Hub Demo").
3. Use a secure email and password (e.g., `admin@cafehub.demo`).
4. Click **Create Workspace**.
5. This secure Server Action will:
   - Create the Auth account.
   - Create the `restaurants` record.
   - Create your `profiles` record linked to that restaurant with the `admin` role.
   - Automatically log you in and redirect you to `/dashboard`.

## Step 2: Create Operational Staff
Now that you are an authenticated Admin, you have the authorization to provision staff accounts for the demo.

1. In the Admin Dashboard, navigate to **Staff & Roles** (`/staff`).
2. Click **Add Staff Member**.
3. Create a **Cashier** account:
   - Name: "Charlie Cashier"
   - Email: `cashier@cafehub.demo`
   - Role: `Cashier`
   - Password: Provide a secure temporary password.
4. Create a **Waiter** account:
   - Name: "Wendy Waiter"
   - Email: `waiter@cafehub.demo`
   - Role: `Waiter`
5. Create a **Kitchen** account:
   - Name: "Kevin Kitchen"
   - Email: `kitchen@cafehub.demo`
   - Role: `Kitchen Staff`

## Step 3: Demonstrate Routing Matrix
You can now open incognito windows or different browsers to log in as these users at `/staff-login`.
- **Admin**: Has access to `/dashboard` and all settings.
- **Cashier**: Automatically redirected to `/floor`. Has access to POS and Payments. Will be denied access to `/dashboard`.
- **Waiter**: Automatically redirected to `/floor`. Denied access to POS or Admin settings.
- **Kitchen**: Automatically redirected to `/kitchen`. Denied access to POS or Admin settings.

## Security Notes
- Service Role Keys (`SUPABASE_SERVICE_ROLE_KEY`) are kept strictly on the server to execute these insertions atomically.
- Role values are securely assigned on the backend, preventing client-side spoofing during signups.
- Profiles are hard-linked to the Admin's `restaurant_id` to prevent cross-tenant data leakage.
