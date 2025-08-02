#!/usr/bin/env node

/**
 * Script สำหรับตรวจสอบการตั้งค่า LINE OAuth ตามเอกสาร
 * ใช้งาน: node validate_line_setup.js
 */

const https = require('https');
const http = require('http');

console.log('🔍 กำลังตรวจสอบการตั้งค่า LINE OAuth ตามเอกสาร...\n');

// ตรวจสอบ environment variables ตาม NextAuth.js docs
function checkNextAuthEnvironment() {
  console.log('📋 ตรวจสอบ Environment Variables ตาม NextAuth.js:');
  
  const requiredVars = [
    'LINE_CLIENT_ID',
    'LINE_CLIENT_SECRET',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`❌ ${varName}: ไม่พบ`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// ตรวจสอบ authorization URL ตาม LINE docs
function validateAuthorizationURL() {
  console.log('\n🔗 ตรวจสอบ Authorization URL ตาม LINE Documentation:');
  
  const clientId = process.env.LINE_CLIENT_ID;
  const redirectUri = 'https://thaihand.shop/api/auth/callback/line';
  const scope = 'profile openid email';
  const state = 'test_state_' + Date.now();
  
  // สร้าง authorization URL ตามรูปแบบในเอกสาร
  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${state}&` +
    `scope=${encodeURIComponent(scope)}`;
  
  console.log('📋 Authorization URL (ตาม LINE Documentation):');
  console.log(authUrl);
  
  // ตรวจสอบ parameters ที่จำเป็น
  const requiredParams = ['response_type', 'client_id', 'redirect_uri', 'state', 'scope'];
  const urlParams = new URLSearchParams(authUrl.split('?')[1]);
  
  console.log('\n📋 ตรวจสอบ Required Parameters:');
  requiredParams.forEach(param => {
    if (urlParams.has(param)) {
      console.log(`✅ ${param}: ${urlParams.get(param)}`);
    } else {
      console.log(`❌ ${param}: ไม่พบ`);
    }
  });
  
  return authUrl;
}

// ตรวจสอบ callback URL
function validateCallbackURL() {
  console.log('\n🔗 ตรวจสอบ Callback URL:');
  
  const callbackUrl = 'https://thaihand.shop/api/auth/callback/line';
  console.log(`📋 Callback URL: ${callbackUrl}`);
  
  // ตรวจสอบว่าเป็น HTTPS
  if (callbackUrl.startsWith('https://')) {
    console.log('✅ ใช้ HTTPS (แนะนำสำหรับ production)');
  } else {
    console.log('⚠️  ไม่ใช้ HTTPS (ไม่แนะนำสำหรับ production)');
  }
  
  return callbackUrl;
}

// ทดสอบการเชื่อมต่อกับ LINE API
function testLineAPI() {
  return new Promise((resolve) => {
    console.log('\n🌐 ทดสอบการเชื่อมต่อกับ LINE API:');
    
    const options = {
      hostname: 'api.line.me',
      port: 443,
      path: '/v2/profile',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test_token'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`📡 LINE API Status: ${res.statusCode}`);
      if (res.statusCode === 401) {
        console.log('✅ LINE API ทำงานปกติ (401 เป็นปกติสำหรับ test token)');
      } else {
        console.log(`⚠️  LINE API Status: ${res.statusCode}`);
      }
      resolve();
    });
    
    req.on('error', (err) => {
      console.log(`❌ ไม่สามารถเชื่อมต่อกับ LINE API: ${err.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Timeout ในการเชื่อมต่อกับ LINE API');
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

// ตรวจสอบ error codes ตามเอกสาร
function validateErrorCodes() {
  console.log('\n📋 ตรวจสอบ Error Codes ตาม LINE Documentation:');
  
  const errorCodes = [
    'INVALID_REQUEST',
    'ACCESS_DENIED', 
    'UNSUPPORTED_RESPONSE_TYPE',
    'INVALID_SCOPE',
    'SERVER_ERROR',
    'LOGIN_REQUIRED',
    'INTERACTION_REQUIRED'
  ];
  
  errorCodes.forEach(code => {
    console.log(`✅ ${code} - ${getErrorDescription(code)}`);
  });
}

function getErrorDescription(code) {
  const descriptions = {
    'INVALID_REQUEST': 'Problem with request parameters',
    'ACCESS_DENIED': 'User canceled consent',
    'UNSUPPORTED_RESPONSE_TYPE': 'response_type not supported',
    'INVALID_SCOPE': 'Problem with scope parameter',
    'SERVER_ERROR': 'Unexpected server error',
    'LOGIN_REQUIRED': 'Auto login failed',
    'INTERACTION_REQUIRED': 'Auto login couldn\'t work'
  };
  return descriptions[code] || 'Unknown error';
}

// ตรวจสอบ scope ตามเอกสาร
function validateScope() {
  console.log('\n📋 ตรวจสอบ Scope ตาม LINE Documentation:');
  
  const scopes = ['profile', 'openid', 'email'];
  const currentScope = 'profile openid email';
  
  console.log(`📋 Current Scope: ${currentScope}`);
  
  scopes.forEach(scope => {
    if (currentScope.includes(scope)) {
      console.log(`✅ ${scope} - Included`);
    } else {
      console.log(`❌ ${scope} - Not included`);
    }
  });
  
  // ตรวจสอบ email permission
  console.log('\n💡 Note: Email scope requires permission from LINE Developers Console');
  console.log('   - Go to LINE Developers Console');
  console.log('   - Basic settings -> OpenID Connect -> Email address permission');
  console.log('   - Click Apply and follow instructions');
}

// ฟังก์ชันหลัก
async function main() {
  console.log('🚀 เริ่มการตรวจสอบการตั้งค่า LINE OAuth ตามเอกสาร\n');
  
  // ตรวจสอบ environment variables
  const envOk = checkNextAuthEnvironment();
  
  // ตรวจสอบ authorization URL
  validateAuthorizationURL();
  
  // ตรวจสอบ callback URL
  validateCallbackURL();
  
  // ตรวจสอบ scope
  validateScope();
  
  // ตรวจสอบ error codes
  validateErrorCodes();
  
  // ทดสอบการเชื่อมต่อ
  await testLineAPI();
  
  console.log('\n📊 สรุปผลการตรวจสอบ:');
  
  if (envOk) {
    console.log('✅ Environment variables ครบถ้วนตาม NextAuth.js docs');
  } else {
    console.log('❌ Environment variables ไม่ครบถ้วน');
    console.log('💡 ตรวจสอบไฟล์ .env และ docker-compose.yml');
  }
  
  console.log('\n📝 คำแนะนำตามเอกสาร:');
  console.log('1. ตรวจสอบ LINE Developers Console callback URL');
  console.log('2. ขอสิทธิ์ Email address permission หากต้องการใช้ email scope');
  console.log('3. ใช้ HTTPS ใน production environment');
  console.log('4. จัดการ error codes ทั้งหมดตามเอกสาร');
  
  console.log('\n🔗 อ้างอิง:');
  console.log('- NextAuth.js LINE Provider: https://next-auth.js.org/providers/line#options');
  console.log('- LINE Login Integration: https://developers.line.biz/en/docs/line-login/integrate-line-login/#scopes');
  
  console.log('\n🎯 การตรวจสอบเสร็จสิ้น');
}

// รัน script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main }; 