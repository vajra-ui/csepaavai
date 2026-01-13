import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeIdentifier(input: string) {
  return input.trim();
}

function sanitizeForEmailLocalPart(input: string) {
  // Keep a predictable and safe local-part
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 48);
}

function normalizeDob(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // Accept:
  // - YYYY-MM-DD
  // - DD/MM/YYYY or DD-MM-YYYY
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return raw;

  const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const dd = String(dmy[1]).padStart(2, "0");
    const mm = String(dmy[2]).padStart(2, "0");
    const yyyy = dmy[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_PUBLIC") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    const body = await req.json().catch(() => null);
    const portalType = body?.portalType;
    const identifierRaw = String(body?.identifier ?? "");
    const dobRaw = String(body?.dob ?? "");

    if (portalType !== "student") {
      return new Response(JSON.stringify({ error: "Unsupported portal" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const identifier = normalizeIdentifier(identifierRaw);
    const dob = normalizeDob(dobRaw);

    if (!identifier || !dob) {
      return new Response(JSON.stringify({ error: "Please provide Roll/Register Number and DOB (YYYY-MM-DD)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find student by roll OR register + DOB
    const { data: students, error: findErr } = await admin
      .from("students")
      .select("id, roll_number, register_number, user_id, is_active, date_of_birth")
      .or(`roll_number.eq.${identifier},register_number.eq.${identifier}`)
      .eq("date_of_birth", dob)
      .limit(1);

    if (findErr) {
      console.error("portal-login find student error", findErr);
      return new Response(JSON.stringify({ error: "Login failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const student = students?.[0];

    if (!student) {
      return new Response(JSON.stringify({ error: "Invalid Roll/Register Number or Date of Birth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (student.is_active === false) {
      return new Response(JSON.stringify({ error: "Portal Not Activated" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rollSafe = sanitizeForEmailLocalPart(String(student.roll_number));
    const email = `student.${rollSafe}@portal.local`;

    let userId = student.user_id as string | null;

    // Provision auth user if missing
    if (!userId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: dob,
        email_confirm: true,
        user_metadata: {
          portal: "student",
          roll_number: student.roll_number,
        },
      });

      if (createErr) {
        // If user already exists (duplicate email), try to find it
        const { data: existingUsers } = await admin.auth.admin.listUsers();
        const existing = existingUsers?.users?.find((u) => u.email === email);
        if (!existing) {
          console.error("portal-login create user error", createErr);
          return new Response(JSON.stringify({ error: "Account setup failed" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        userId = existing.id;
      } else {
        userId = created.user.id;
      }

      // Link student -> auth user
      const { error: linkErr } = await admin
        .from("students")
        .update({ user_id: userId })
        .eq("id", student.id);

      if (linkErr) {
        console.error("portal-login link student error", linkErr);
      }

      // Ensure role exists
      const { data: existingRole } = await admin
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", "student")
        .maybeSingle();

      if (!existingRole) {
        await admin.from("user_roles").insert({ user_id: userId, role: "student" });
      }
    }

    // Exchange for session tokens via password grant
    // If SUPABASE_ANON_KEY isn't available, the service key still works for token exchange.
    const apiKey = supabaseAnonKey ?? supabaseServiceKey;

    const tokenResp = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({ email, password: dob }),
    });

    const tokenJson = await tokenResp.json().catch(() => ({}));

    if (!tokenResp.ok) {
      console.error("portal-login token error", tokenJson);
      return new Response(JSON.stringify({ error: "Invalid login credentials" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(tokenJson), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("portal-login error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
