// Test script to run in the browser console
async function testApi() {
    try {
        console.log('=== Testing API ===');
        
        // Test api.getHeroes directly
        const response = await api.getHeroes(1, '');
        console.log('api.getHeroes response:', response);
        
        // Test fetch directly
        const fetchResponse = await fetch('/api/admin/heroes', {
            headers: { 'x-admin-token': 'textical-admin-2024' }
        });
        const fetchData = await fetchResponse.json();
        console.log('fetch response:', fetchData);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testApi();
