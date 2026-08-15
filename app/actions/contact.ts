'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { headers } from 'next/headers';

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  // Honeypot field - must be empty
  website: z.string().max(0, "Invalid submission").optional().or(z.literal('')),
});

// Simple in-memory rate limiting (IP -> timestamps)
// In a serverless environment (Vercel), this memory resets per cold start/instance,
// but it's sufficient for basic spam deterrence without needing Redis.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

export async function submitContact(formData: FormData) {
  try {
    // 1. Rate Limiting Check
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    if (ip !== 'unknown') {
      const now = Date.now();
      const userRequests = rateLimitMap.get(ip) || [];
      
      // Filter requests within the window
      const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
      
      if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return {
          success: false,
          error: "Too many requests. Please try again later.",
        };
      }
      
      recentRequests.push(now);
      rateLimitMap.set(ip, recentRequests);
    }

    // 2. Parse and Validate Data
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      website: formData.get('website'), // Honeypot
    };

    const parsed = contactSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        validationErrors: errors,
      };
    }

    const { name, email, message, website } = parsed.data;

    // 3. Honeypot Check
    // If a bot fills out the hidden 'website' field, we pretend it succeeded.
    if (website && website.length > 0) {
      console.warn(`Honeypot triggered by IP: ${ip}`);
      // Simulate network delay for bots
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true }; 
    }

    // 4. Save to Database
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
      },
    });

    // ------------------------------------------------------------------------
    // TODO: Add Email Notification Logic Here
    // E.g. using Resend:
    // await resend.emails.send({
    //   from: 'Portfolio <contact@yourdomain.com>',
    //   to: 'youremail@gmail.com',
    //   subject: `New Message from ${name}`,
    //   text: message,
    //   reply_to: email
    // });
    // ------------------------------------------------------------------------

    return { success: true };
    
  } catch (error) {
    console.error('Contact submission error:', error);
    return {
      success: false,
      error: 'Failed to send message. Please try again or reach out via email.',
    };
  }
}
