// Diagnostic tool to check API connection
// Add this to your browser console on the deployed frontend

async function testApiConnection() {
    console.log('🔍 Testing API Connection...');
    
    // Get the API URL being used
    const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    console.log('📡 API Base URL:', apiUrl);
    console.log('🌐 Current Frontend URL:', window.location.origin);
    
    try {
        // Test basic connection
        console.log('⏳ Testing basic connection...');
        const response = await fetch(`${apiUrl}/`);
        const text = await response.text();
        console.log('✅ Basic connection successful:', text);
        
        // Test API endpoint
        console.log('⏳ Testing API endpoint...');
        const apiResponse = await fetch(`${apiUrl}/api/users`);
        if (apiResponse.ok) {
            console.log('✅ API endpoint accessible');
        } else {
            console.log('❌ API endpoint error:', apiResponse.status, apiResponse.statusText);
        }
        
    } catch (error) {
        console.error('❌ Connection failed:', error);
        console.log('🔧 Possible issues:');
        console.log('1. Backend not deployed');
        console.log('2. Wrong VITE_API_BASE_URL in Vercel env vars');
        console.log('3. CORS not configured for frontend domain');
        console.log('4. Backend environment variables missing');
    }
}

// Run the test
testApiConnection();
