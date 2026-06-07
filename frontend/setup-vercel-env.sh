#!/bin/bash
# Setup Vercel Environment Variables

echo "Setting up Vercel environment variables..."

# Set environment variables for production
vercel env add VITE_SUPABASE_URL production <<< "https://vnkvdnagnkvlyrnkeczh.supabase.co"
vercel env add VITE_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU2NDYsImV4cCI6MjA5MzIwMTY0Nn0.hiQj72oMfM4smSzbDBKcxIJnIdcUZ9RrGVdOpq8lSbE"
vercel env add VITE_API_URL production <<< "https://arms-c56l.onrender.com"
vercel env add VITE_GEOAPIFY_API_KEY production <<< "b420e94b0c8a46d39bc3c7e2dda83811"
vercel env add VITE_PAYSTACK_PUBLIC_KEY production <<< "pk_test_fa6746bb37adf4c948f664f6c5f828232212ca8e"
vercel env add VITE_ENABLE_ADMIN_SIGNUP production <<< "false"
vercel env add VITE_ENABLE_PAYOUTS production <<< "true"

# Set for preview environment too
vercel env add VITE_SUPABASE_URL preview <<< "https://vnkvdnagnkvlyrnkeczh.supabase.co"
vercel env add VITE_SUPABASE_ANON_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZua3ZkbmFnbmt2bHlybmtlY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjU2NDYsImV4cCI6MjA5MzIwMTY0Nn0.hiQj72oMfM4smSzbDBKcxIJnIdcUZ9RrGVdOpq8lSbE"
vercel env add VITE_API_URL preview <<< "https://arms-c56l.onrender.com"
vercel env add VITE_GEOAPIFY_API_KEY preview <<< "b420e94b0c8a46d39bc3c7e2dda83811"
vercel env add VITE_PAYSTACK_PUBLIC_KEY preview <<< "pk_test_fa6746bb37adf4c948f664f6c5f828232212ca8e"
vercel env add VITE_ENABLE_ADMIN_SIGNUP preview <<< "false"
vercel env add VITE_ENABLE_PAYOUTS preview <<< "true"

echo "Environment variables configured!"
echo "Now run: vercel --prod"
