import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AwsClient } from "https://deno.land/x/aws4fetch@v1.0.17/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify User Session
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return new Response(JSON.stringify({ error: 'filename and contentType are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 2. Setup Cloudflare R2 AWS Client
    const accountId = Deno.env.get('R2_ACCOUNT_ID');
    const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY');
    const bucketName = Deno.env.get('R2_BUCKET_NAME');

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
       return new Response(JSON.stringify({ error: 'R2 credentials not configured on server' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // --- RATE LIMITING LOGIC ---
    // Calculate timestamp for 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Query recent upload requests
    const { count, error: countError } = await supabaseClient
      .from('upload_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error('Rate limit check failed:', countError);
    } else if (count !== null && count >= 10) {
      // User has hit the rate limit (10 per hour). Check if we should alert the admin.
      const { data: recentAlerts } = await supabaseClient
        .from('admin_alerts')
        .select('*')
        .eq('alert_type', 'high_upload_traffic')
        .eq('user_id', user.id)
        .gte('created_at', oneHourAgo)
        .limit(1);

      // If no alert sent in the last hour for this user, send one.
      if (!recentAlerts || recentAlerts.length === 0) {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        const adminEmail = Deno.env.get('ADMIN_EMAIL');

        if (resendApiKey && adminEmail) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'security@yourdomain.com', // Replace with a verified domain later if needed
                to: adminEmail,
                subject: 'High Traffic Upload Alert',
                html: `<p>User <strong>${user.id}</strong> has attempted to request more than 10 upload URLs in the last hour.</p><p>They have been rate limited automatically.</p>`
              })
            });
            // Log that an alert was sent
            await supabaseClient.from('admin_alerts').insert({
              alert_type: 'high_upload_traffic',
              user_id: user.id
            });
          } catch (e) {
            console.error('Failed to send Resend alert:', e);
          }
        } else {
          console.error('RESEND_API_KEY or ADMIN_EMAIL missing. Could not send alert.');
        }
      }

      // Reject the user request
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in an hour.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      });
    }

    // Log the successful request
    await supabaseClient.from('upload_requests').insert({ user_id: user.id });
    // --- END RATE LIMITING LOGIC ---

    const aws = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: 's3',
      region: 'auto',
    });

    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    // Create a safe, unique filename
    const ext = filename.split('.').pop() || 'jpg';
    const safeFilename = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const objectUrl = `${endpoint}/${bucketName}/${safeFilename}`;

    // 3. Generate Pre-signed URL
    const url = new URL(objectUrl);
    url.searchParams.set('X-Amz-Expires', '60'); // Expires in 60 seconds

    const signedRequest = await aws.sign(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
    });

    const publicUrl = Deno.env.get('R2_PUBLIC_DOMAIN') 
      ? `https://${Deno.env.get('R2_PUBLIC_DOMAIN')}/${safeFilename}`
      : `https://${bucketName}.${accountId}.r2.dev/${safeFilename}`; // Fallback, usually needs proper public domain

    return new Response(
      JSON.stringify({
        uploadUrl: signedRequest.url,
        publicUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
