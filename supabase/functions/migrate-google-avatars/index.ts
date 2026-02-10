import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Admin client (Service Role) for DB operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get Auth Header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Missing authorization header" }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify User Session
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify Admin Role
    const { data: role, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !role) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized: Admins only" }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🚀 Starting migration for admin: ${user.email}`);

    // 1. Get profiles with Google avatars
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, avatar_url')
      .like('avatar_url', '%lh3.googleusercontent.com%');

    if (fetchError) throw fetchError;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0, message: "No profiles found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let successCount = 0;
    let failCount = 0;

    for (const profile of profiles) {
      try {
        const url = profile.avatar_url;
        console.log(`🔄 Migrating ${profile.id}...`);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const blob = await res.blob();
        const contentType = res.headers.get('content-type') || 'image/png';
        const fileExt = contentType.split('/')[1] || 'png';
        const filePath = `${profile.id}/avatar_migrated_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('profile-assets')
          .upload(filePath, blob, { contentType, upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('profile-assets')
          .getPublicUrl(filePath);

        await supabaseAdmin
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', profile.id);

        successCount++;
        console.log(`✅ Success for ${profile.id}`);
      } catch (err) {
        console.error(`❌ Failed for ${profile.id}:`, err);
        failCount++;
      }
    }

    return new Response(JSON.stringify({ success: true, successCount, failCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
