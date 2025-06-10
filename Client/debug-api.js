// Debug API Configuration - Place this in browser console on deployed site
console.log('🔍 API Configuration Debug');
console.log('==========================');

// Check environment variables
console.log('Environment Variables:');
console.log('- VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('- NODE_ENV:', import.meta.env.NODE_ENV);
console.log('- MODE:', import.meta.env.MODE);

// Check computed API URLs
console.log('\nComputed API URLs:');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/api`;
console.log('- API_BASE_URL:', API_BASE_URL);
console.log('- API_URL:', API_URL);

// Test API endpoints
async function testEndpoints() {
    console.log('\n🧪 Testing API Endpoints:');
    console.log('========================');
    
    try {
        // Test 1: Base URL
        console.log('⏳ Testing base URL:', API_BASE_URL);
        const baseResponse = await fetch(API_BASE_URL);
        console.log('- Status:', baseResponse.status);
        console.log('- Headers:', Object.fromEntries(baseResponse.headers.entries()));
        const baseText = await baseResponse.text();
        console.log('- Response:', baseText.substring(0, 200) + (baseText.length > 200 ? '...' : ''));
        
        // Test 2: API URL
        console.log('\n⏳ Testing API URL:', `${API_URL}/staff`);
        const apiResponse = await fetch(`${API_URL}/staff`);
        console.log('- Status:', apiResponse.status);
        console.log('- Content-Type:', apiResponse.headers.get('content-type'));
        
        if (apiResponse.headers.get('content-type')?.includes('application/json')) {
            const data = await apiResponse.json();
            console.log('- JSON Response:', data);
        } else {
            const text = await apiResponse.text();
            console.log('- Text Response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
        }
        
    } catch (error) {
        console.error('❌ Error testing endpoints:', error);
    }
}

testEndpoints();
