#!/usr/bin/env node

/**
 * Script สำหรับทดสอบ LINE Login Configuration
 * ใช้งาน: node test_line_login.js
 */

const https = require('https');
const http = require('http');

console.log('🔍 กำลังทดสอบ LINE Login Configuration...\n');

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

// ทดสอบการเชื่อมต่อกับ NextAuth callback
function testNextAuthCallback() {
  return new Promise((resolve) => {
    console.log('\n🔗 ทดสอบ NextAuth Callback URL...');
    
    const callbackUrl = process.env.NEXTAUTH_URL + '/api/auth/callback/line';
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
      console.log(`📡 NextAuth Callback Status: ${res.statusCode}`);
      if (res.statusCode === 200 || res.statusCode === 302) {
        console.log('✅ NextAuth Callback URL ทำงานปกติ');
      } else {
        console.log(`⚠️  NextAuth Callback Status: ${res.statusCode}`);
      }
      resolve();
    });
    
    req.on('error', (err) => {
      console.log(`❌ ไม่สามารถเชื่อมต่อกับ NextAuth Callback: ${err.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Timeout ในการเชื่อมต่อกับ NextAuth Callback');
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
  console.log('🚀 เริ่มการทดสอบ LINE Login Configuration\n');
  
  // ตรวจสอบ environment variables
  const envOk = checkEnvironmentVariables();
  
  // ทดสอบการเชื่อมต่อ
  await testLineAPI();
  await testNextAuthCallback();
  await checkDockerContainers();
  
  console.log('\n📊 สรุปผลการทดสอบ:');
  
  if (envOk) {
    console.log('✅ Environment variables ครบถ้วน');
  } else {
    console.log('❌ Environment variables ไม่ครบถ้วน');
    console.log('💡 ตรวจสอบไฟล์ .env และ docker-compose.yml');
  }
  
  console.log('\n📝 คำแนะนำ:');
  console.log('1. ตรวจสอบ LINE Developers Console ว่าตั้งค่า Callback URL ถูกต้อง');
  console.log('2. ตรวจสอบ LINE_CLIENT_ID และ LINE_CLIENT_SECRET');
  console.log('3. รีสตาร์ท Docker containers: docker-compose down && docker-compose up -d');
  console.log('4. ตรวจสอบ logs: docker-compose logs frontend');
  
  console.log('\n🎯 การทดสอบเสร็จสิ้น');
}

// รัน script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main }; 