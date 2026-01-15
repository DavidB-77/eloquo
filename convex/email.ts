// Email Functions using Resend Component
// Replaces broken Supabase email with reliable Resend delivery

import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Initialize Resend - test mode disabled since eloquo.io is verified
export const resend = new Resend(components.resend, {
  testMode: false,
});

/**
 * Send email confirmation to new user
 * Callable from Next.js API routes
 */
export const sendConfirmationEmail = mutation({
  args: {
    email: v.string(),
    confirmUrl: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { email, confirmUrl, name }) => {
    await resend.sendEmail(ctx, {
      from: "Eloquo <noreply@eloquo.io>",
      to: email,
      subject: "Confirm your Eloquo account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; background-color: #0a0a0a;">
          <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; padding: 40px; border: 1px solid #333;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #09B7B4; font-size: 28px; margin: 0;">Eloquo</h1>
            </div>
            
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px;">Welcome${name ? `, ${name}` : ""}!</h2>
            
            <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              Thanks for signing up for Eloquo. Click the button below to confirm your email address and activate your account.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #09B7B4 0%, #07A19E 100%); color: #000000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                Confirm Email
              </a>
            </div>
            
            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
              If you didn't create an account, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;">
            
            <p style="color: #666666; font-size: 12px; text-align: center; margin: 0;">
              This link expires in 24 hours.<br>
              <a href="https://eloquo.io" style="color: #09B7B4;">eloquo.io</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });
  },
});

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = mutation({
  args: {
    email: v.string(),
    resetUrl: v.string(),
  },
  handler: async (ctx, { email, resetUrl }) => {
    await resend.sendEmail(ctx, {
      from: "Eloquo <noreply@eloquo.io>",
      to: email,
      subject: "Reset your Eloquo password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; background-color: #0a0a0a;">
          <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; padding: 40px; border: 1px solid #333;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #09B7B4; font-size: 28px; margin: 0;">Eloquo</h1>
            </div>
            
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px;">Reset Your Password</h2>
            
            <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              We received a request to reset your password. Click the button below to choose a new one.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #09B7B4 0%, #07A19E 100%); color: #000000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;">
            
            <p style="color: #666666; font-size: 12px; text-align: center; margin: 0;">
              This link expires in 1 hour.<br>
              <a href="https://eloquo.io" style="color: #09B7B4;">eloquo.io</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });
  },
});

/**
 * Send welcome email after subscription purchase
 */
export const sendWelcomeEmail = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    tier: v.string(),
  },
  handler: async (ctx, { email, name, tier }) => {
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

    await resend.sendEmail(ctx, {
      from: "Eloquo <hello@eloquo.io>",
      to: email,
      subject: `Welcome to Eloquo ${tierName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; background-color: #0a0a0a;">
          <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; padding: 40px; border: 1px solid #333;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #09B7B4; font-size: 28px; margin: 0;">Eloquo</h1>
            </div>
            
            <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px;">Welcome to Eloquo${tierName !== 'Free' ? ` ${tierName}` : ''}! 🎉</h2>
            
            <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              ${name ? `Hey ${name}, ` : ''}You're all set up and ready to start optimizing your AI prompts. 
              ${tierName === 'Pro' || tierName === 'Business' ? "As a founding member, you've locked in special pricing forever!" : ''}
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://eloquo.io/dashboard" style="display: inline-block; background: linear-gradient(135deg, #09B7B4 0%, #07A19E 100%); color: #000000; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                Open Dashboard
              </a>
            </div>
            
            <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #09B7B4; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Quick Tips:</p>
              <ul style="color: #a0a0a0; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Use the optimizer to enhance prompts for any AI model</li>
                <li>Try different strength levels for varied results</li>
                <li>Rate your results to help improve the AI</li>
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;">
            
            <p style="color: #666666; font-size: 12px; text-align: center; margin: 0;">
              Questions? Reply to this email or visit our <a href="https://eloquo.io/support" style="color: #09B7B4;">support page</a>.<br>
              <a href="https://eloquo.io" style="color: #09B7B4;">eloquo.io</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });
  },
});
