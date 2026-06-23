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
    url.searchParams.set('X-Amz-Expires', '3600');

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
