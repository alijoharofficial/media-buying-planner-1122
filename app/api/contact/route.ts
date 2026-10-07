import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/contact';
import { CONTACT_EMAIL } from '@/lib/site';

// Per-IP rate limit: 5 messages per 10 minutes. In-memory, so it is per server instance;
// use a shared store (e.g. Upstash/Vercel KV) if you run many instances.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return recent.length > MAX_PER_WINDOW;
}

const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });
const isProd = process.env.NODE_ENV === 'production';

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return !isProd; // required in production, skipped in development
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return Boolean(data.success);
}

async function sendEmail(name: string, email: string, message: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? CONTACT_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !from) {
    if (isProd) return false;
    console.info('[contact] email not configured; message accepted in development only');
    return true;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, reply_to: email, subject: `Media Buying Planner contact: ${name}`, text: `From: ${name} <${email}>\n\n${message}` }),
  });
  return res.ok;
}

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  if (rateLimited(ip)) return fail(429, 'rateLimited');

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail(400, 'invalid');
  }
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) return fail(400, 'invalid');
  const { name, email, message, website, token } = parsed.data;

  // Honeypot filled: pretend success so bots learn nothing.
  if (website) return NextResponse.json({ ok: true });

  try {
    if (!(await verifyTurnstile(token, ip))) return fail(400, 'verification');
    if (!(await sendEmail(name, email, message))) return fail(503, 'unavailable');
  } catch {
    return fail(500, 'unavailable');
  }
  return NextResponse.json({ ok: true });
}
