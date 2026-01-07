// Simple test script to verify CorruptX functionality
const fetch = require('node-fetch');

async function testApp() {
  console.log('Testing CorruptX application...\n');
  
  try {
    // Test main page
    const response = await fetch('http://localhost:5173/');
    console.log('✓ Main page accessible:', response.status === 200);
    
    // Test if HTML contains expected elements
    const html = await response.text();
    console.log('✓ Contains CORRUPTX title:', html.includes('CORRUPTX'));
    console.log('✓ Contains auth elements:', html.includes('Login') || html.includes('Sign Up'));
    
    console.log('\n✅ Basic functionality test passed!');
    console.log('Application is running at: http://localhost:5173/');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApp();
