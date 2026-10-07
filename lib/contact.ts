import { z } from 'zod';

/** Shared by the contact form (client) and /api/contact (server). Error codes map to contact.errors.<code>. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'name').max(100, 'name'),
  email: z.string().trim().email('email').max(200, 'email'),
  message: z.string().trim().min(10, 'message').max(5000, 'message'),
  /** Honeypot: people leave it empty; the API silently drops messages where it is filled. */
  website: z.string().max(500).optional(),
  token: z.string().max(4096).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
