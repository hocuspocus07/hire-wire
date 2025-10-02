"use server"

import { createClient } from "./supabase/server";
import { cookies } from "next/headers";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;

  if (!["interviewer", "candidate"].includes(role)) {
    return { error: "Invalid role" };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
    data: { name, role },
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  },
  });

  if (authError) {
    if (authError.code === "user_already_exists" || authError.code === "email_exists") {
        return { error: "duplicate" };
      }
    return { error: authError.message };
  }

  if (authData.user) {
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
      });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { error: profileError.message };
    }

    return { success: true, user: authData.user };
  }

  return { error: "Signup failed" };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email=formData.get('email') as string;
  const password=formData.get('password')as string;
  const {data:authData,error:authError}=await supabase.auth.signInWithPassword({email,password});
  if(authError){
    return{error:authError.message,code:authError.code}
  }

  if (!authData.user) {
    return { error: "No user found" }
  }

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single()
    if (userError || !userRow) {
    return { error: "Role not found",code:"role_missing"}
  }

  if(authData?.session){
    (await cookies()).set('sb-access-token',authData.session.access_token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:'lax',
    });
    (await cookies()).set("sb-refresh-token", authData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
    });
  }
  return { success: true, role: userRow.role }
}

export async function signOut(){
    const supabase = await createClient();
    await supabase.auth.signOut();
    (await cookies()).delete('sb-access-token');
    (await cookies()).delete('sb-refresh-token');
}