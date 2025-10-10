#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import { readFileSync } from 'fs';

// Load .env manually
const envFile = readFileSync('.env', 'utf-8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
});

console.log('🧪 Testing SwipeJob Connections...\n');

// Test 1: Environment Variables
console.log('1️⃣  Checking environment variables...');
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'GROQ_API_KEY'
];

const missingVars = requiredVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error('   ❌ Missing:', missingVars.join(', '));
  process.exit(1);
}
console.log('   ✅ All environment variables present\n');

// Test 2: Supabase Connection
console.log('2️⃣  Testing Supabase connection...');
try {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  
  // Test connection by checking service status
  const { data, error } = await supabase.auth.getSession();
  
  if (error && error.message !== 'Auth session missing!') {
    throw error;
  }
  
  console.log('   ✅ Supabase client initialized');
  console.log('   📍 URL:', process.env.VITE_SUPABASE_URL);
  console.log('   🔑 Auth: Ready (no active session)\n');
} catch (error) {
  console.error('   ❌ Supabase connection failed:', error.message);
  process.exit(1);
}

// Test 3: Groq API
console.log('3️⃣  Testing Groq AI API...');
try {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
  
  console.log('   Testing with simple prompt...');
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: 'Reply with exactly: "Connection successful!"'
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0,
    max_tokens: 10
  });
  
  const response = completion.choices[0]?.message?.content || '';
  console.log('   ✅ Groq API connected');
  console.log('   🤖 Model: llama-3.3-70b-versatile');
  console.log('   💬 Response:', response.trim());
  console.log('   ⚡ Tokens used:', completion.usage?.total_tokens || 'N/A');
  console.log('');
} catch (error) {
  console.error('   ❌ Groq API failed:', error.message);
  process.exit(1);
}

// Test 4: Database URL (optional)
console.log('4️⃣  Checking DATABASE_URL (backend)...');
if (process.env.DATABASE_URL) {
  console.log('   ✅ DATABASE_URL is set');
  console.log('   🗄️  Backend database: Ready\n');
} else {
  console.log('   ⚠️  DATABASE_URL not set');
  console.log('   ℹ️  Backend API routes will not work');
  console.log('   ℹ️  See SETUP_DATABASE.md for instructions\n');
}

// Summary
console.log('📊 Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Supabase Auth:     READY');
console.log('✅ Groq AI:           READY');
console.log(process.env.DATABASE_URL ? '✅ Backend Database:  READY' : '⚠️  Backend Database:  NOT CONFIGURED');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

if (!process.env.DATABASE_URL) {
  console.log('⚠️  To complete setup:');
  console.log('   1. Get DATABASE_URL from Supabase dashboard');
  console.log('   2. Add it to .env file');
  console.log('   3. Run: npm run db:push');
  console.log('   4. See: SETUP_DATABASE.md');
} else {
  console.log('✅ All systems ready!');
  console.log('   Run: npm run dev');
}

console.log('');
