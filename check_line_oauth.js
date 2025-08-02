#!/usr/bin/env node

/**
 * Script สำหรับตรวจสอบการตั้งค่า LINE OAuth
 * ใช้งาน: node check_line_oauth.js
 */

const https = require('https');
const http = require('http');

console.log('🔍 กำลังตรวจสอบการตั้งค่า LINE OAuth...\n');

// ตรวจสอบ environment variables
function checkEnvironmentVariables() {
  console.log('📋 ตรวจสอบ Environment Variables:');
  
  const requiredVars = [
    'LINE_CLIENT_ID',
    'LINE_CLIENT_SECRET',
    'NEXT_PUBLIC_LINE_CLIENT_ID',
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

// ทดสอบการสร้าง authorization URL
function testAuthorizationURL() {
  console.log('\n🔗 ทดสอบการสร้าง Authorization URL...');
  
  const clientId = process.env.LINE_CLIENT_ID;
  const redirectUri = 'https://thaihand.shop/api/auth/callback/line';
  const scope = 'profile openid email';
  const state = 'test_state_' + Date.now();
  
  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `state=${state}`;
  
  console.log('📋 Authorization URL:');
  console.log(authUrl);
  
  return authUrl;
}

// ทดสอบการเชื่อมต่อกับ LINE API
function testLineAPI() {
  return new Promise((resolve) => {
    console.log('\n🌐 ทดสอบการเชื่อมต่อกับ LINE API...');
    
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

// ทดสอบ callback URL
function testCallbackURL() {
  return new Promise((resolve) => {
    console.log('\n🔗 ทดสอบ Callback URL...');
    
    const callbackUrl = 'https://thaihand.shop/api/auth/callback/line';
    console.log(`📋 Callback URL: ${callbackUrl}`);
    
    const url = new URL(callbackUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET'
    };
    
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      console.log(`📡 Callback URL Status: ${res.statusCode}`);
      if (res.statusCode === 200 || res.statusCode === 302) {
        console.log('✅ Callback URL ทำงานปกติ');
      } else {
        console.log(`⚠️  Callback URL Status: ${res.statusCode}`);
      }
      resolve();
    });
    
    req.on('error', (err) => {
      console.log(`❌ ไม่สามารถเชื่อมต่อกับ Callback URL: ${err.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Timeout ในการเชื่อมต่อกับ Callback URL');
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

// ตรวจสอบ Docker containers
function checkDockerContainers() {
  return new Promise((resolve) => {
    console.log('\n🐳 ตรวจสอบ Docker Containers...');
    
    const { exec } = require('child_process');
    
    exec('docker-compose ps', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ ไม่สามารถตรวจสอบ Docker containers ได้');
        console.log('💡 ตรวจสอบว่า Docker และ docker-compose ติดตั้งแล้ว');
        resolve();
        return;
      }
      
      console.log('📋 Docker Containers Status:');
      console.log(stdout);
      
      if (stdout.includes('Up')) {
        console.log('✅ Docker containers ทำงานปกติ');
      } else {
        console.log('⚠️  Docker containers อาจมีปัญหา');
      }
      
      resolve();
    });
  });
}

// ฟังก์ชันหลัก
async function main() {
  console.log('🚀 เริ่มการตรวจสอบ LINE OAuth Configuration\n');
  
  // ตรวจสอบ environment variables
  const envOk = checkEnvironmentVariables();
  
  // ทดสอบ authorization URL
  testAuthorizationURL();
  
  // ทดสอบการเชื่อมต่อ
  await testLineAPI();
  await testCallbackURL();
  await checkDockerContainers();
  
  console.log('\n📊 สรุปผลการตรวจสอบ:');
  
  if (envOk) {
    console.log('✅ Environment variables ครบถ้วน');
  } else {
    console.log('❌ Environment variables ไม่ครบถ้วน');
    console.log('💡 ตรวจสอบไฟล์ .env และ docker-compose.yml');
  }
  
  console.log('\n📝 คำแนะนำสำหรับการแก้ไขปัญหา OAuthCallback:');
  console.log('1. ตรวจสอบ LINE Developers Console ว่าตั้งค่า Callback URL ถูกต้อง');
  console.log('2. ตรวจสอบ scope ว่าตั้งเป็น "profile openid email"');
  console.log('3. ตรวจสอบ redirect_uri ว่าตรงกับที่ตั้งไว้ใน LINE Developers Console');
  console.log('4. รีสตาร์ท Docker containers: docker-compose down && docker-compose up -d');
  console.log('5. ตรวจสอบ logs: docker-compose logs frontend | grep -i line');
  
  console.log('\n🎯 การตรวจสอบเสร็จสิ้น');
}

// รัน script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main }; 