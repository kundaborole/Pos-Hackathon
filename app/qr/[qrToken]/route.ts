import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken: token } = await params;
  
  if (!token) {
    return NextResponse.json({ error: 'Missing QR Token' }, { status: 400 });
  }

  const supabase = await createClient();

  // Call the secure bootstrap RPC
  const { data, error } = await supabase.rpc('bootstrap_table_session', { p_qr_token: token });

  if (error) {
    console.error('Error bootstrapping QR session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  const result = data as { success: boolean, error?: string, public_token?: string };

  if (!result.success) {
    // Redirect to an error page or show JSON for now
    return NextResponse.redirect(new URL(`/order/error?reason=${result.error}`, request.url));
  }

  // Redirect to the secure customer order portal using the generated active public_token
  // The public_token is high entropy, and validated on every read/write to ensure the session is active.
  return NextResponse.redirect(new URL(`/order/${result.public_token}/menu`, request.url));
}
