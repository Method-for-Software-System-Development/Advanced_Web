// Backend Test Script - Run this in browser console
// This will help us diagnose the backend connection issues

console.log('🔍 Testing Backend Connection...');
console.log('Backend URL:', 'https://server-tal-yagudins-projects.vercel.app');

async function testBackend() {
    const baseUrl = 'https://server-tal-yagudins-projects.vercel.app';
    
    console.log('\n1. Testing base URL...');
    try {
        const response = await fetch(baseUrl);
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        const text = await response.text();
        console.log('Response:', text);
    } catch (error) {
        console.error('Base URL Error:', error);
    }
    
    console.log('\n2. Testing /api/staff endpoint...');
    try {
        const response = await fetch(`${baseUrl}/api/staff`);
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        const text = await response.text();
        console.log('Response:', text.substring(0, 200));
    } catch (error) {
        console.error('API Error:', error);
    }
    
    console.log('\n3. Testing with different URL formats...');
    const urls = [
        `${baseUrl}/api/staff`,
        `${baseUrl}//api/staff`,
        `${baseUrl}/api/staff/`,
    ];
    
    for (const url of urls) {
        try {
            console.log(`Testing: ${url}`);
            const response = await fetch(url);
            console.log(`Status: ${response.status}`);
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }
}

testBackend();
