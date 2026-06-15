#!/usr/bin/env node
/**
 * Generate Bootstrap Token for ARMS Admin Setup
 * 
 * This script generates a secure bootstrap token that can be used to create
 * the first admin user in the ARMS system. This token should be kept secure
 * and only shared with trusted administrators.
 * 
 * Usage:
 *   node scripts/generate-bootstrap-token.js
 *   node scripts/generate-bootstrap-token.js --length 64
 *   node scripts/generate-bootstrap-token.js --env
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Parse command line arguments
const args = process.argv.slice(2)
const lengthArg = args.find(arg => arg.startsWith('--length='))
const tokenLength = lengthArg ? parseInt(lengthArg.split('=')[1]) : 48
const shouldUpdateEnv = args.includes('--env')
const shouldShowHelp = args.includes('--help') || args.includes('-h')

if (shouldShowHelp) {
  console.log(`
ARMS Bootstrap Token Generator

Usage:
  node scripts/generate-bootstrap-token.js [options]

Options:
  --length=N     Token length in bytes (default: 48)
  --env          Automatically update .env file
  --help, -h     Show this help message

Examples:
  node scripts/generate-bootstrap-token.js
  node scripts/generate-bootstrap-token.js --length=64
  node scripts/generate-bootstrap-token.js --env

Security Notes:
  - Keep the bootstrap token secure and private
  - Use HTTPS when accessing the bootstrap URL
  - Token is only valid for initial admin setup
  - Delete or rotate token after first admin is created
`)
  process.exit(0)
}

// Validate token length
if (tokenLength < 32 || tokenLength > 128) {
  console.error('❌ Token length must be between 32 and 128 bytes')
  process.exit(1)
}

try {
  // Generate cryptographically secure random token
  const token = crypto.randomBytes(tokenLength).toString('hex')
  
  console.log(`
🔐 ARMS Bootstrap Token Generated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Token: ${token}
Length: ${tokenLength} bytes (${token.length} characters)
Generated: ${new Date().toISOString()}

🔗 Bootstrap URL:
   ${process.env.FRONTEND_URL || 'https://your-domain.com'}/bootstrap?token=${token}

📋 Environment Variable:
   BOOTSTRAP_ADMIN_TOKEN=${token}

⚠️  SECURITY WARNINGS:
   • Keep this token secure and private
   • Only share with trusted system administrators
   • Use HTTPS when accessing the bootstrap URL
   • This token is only valid for initial admin setup
   • Consider rotating/deleting after first admin is created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

  // Optionally update .env file
  if (shouldUpdateEnv) {
    const envPath = path.join(__dirname, '..', '.env')
    
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8')
      
      // Check if BOOTSTRAP_ADMIN_TOKEN already exists
      if (envContent.includes('BOOTSTRAP_ADMIN_TOKEN=')) {
        // Replace existing token
        envContent = envContent.replace(
          /BOOTSTRAP_ADMIN_TOKEN=.*/,
          `BOOTSTRAP_ADMIN_TOKEN=${token}`
        )
        console.log('✅ Updated existing BOOTSTRAP_ADMIN_TOKEN in .env file')
      } else {
        // Add new token
        envContent += `\n# Bootstrap token for initial admin setup\nBOOTSTRAP_ADMIN_TOKEN=${token}\n`
        console.log('✅ Added BOOTSTRAP_ADMIN_TOKEN to .env file')
      }
      
      fs.writeFileSync(envPath, envContent)
    } else {
      // Create new .env file
      const envContent = `# Bootstrap token for initial admin setup\nBOOTSTRAP_ADMIN_TOKEN=${token}\n`
      fs.writeFileSync(envPath, envContent)
      console.log('✅ Created .env file with BOOTSTRAP_ADMIN_TOKEN')
    }
  } else {
    console.log('\n💡 To automatically update your .env file, run:')
    console.log(`   node scripts/generate-bootstrap-token.js --env`)
    console.log('\n   Or manually add this to your .env file:')
    console.log(`   BOOTSTRAP_ADMIN_TOKEN=${token}`)
  }

  console.log('\n🚀 Next Steps:')
  console.log('   1. Add the token to your .env file (if not done automatically)')
  console.log('   2. Restart your backend server')
  console.log('   3. Share the bootstrap URL with your admin')
  console.log('   4. Admin can access the URL to create the first admin account')
  console.log('   5. Subsequent admins should be invited through the admin panel')
  console.log()

} catch (error) {
  console.error('❌ Error generating bootstrap token:', error.message)
  process.exit(1)
}

// Optional: Create a bootstrap URL helper
function createBootstrapUrl(token) {
  const baseUrl = process.env.FRONTEND_URL || 'https://your-arms-domain.com'
  return `${baseUrl}/bootstrap?token=${encodeURIComponent(token)}`
}

// Export for programmatic use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateToken: (length = 48) => crypto.randomBytes(length).toString('hex'),
    createBootstrapUrl
  }
}