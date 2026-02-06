export async function getLocationFromIp(ip: string): Promise<string> {
    try {
        // Handle localhost/private IPs
        if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return 'Localhost';
        }

        const response = await fetch(`http://ip-api.com/json/${ip}`);
        if (!response.ok) {
            return 'Unknown';
        }

        const data = await response.json();
        if (data.status === 'success') {
            const parts = [];
            if (data.city) parts.push(data.city);
            if (data.regionName) parts.push(data.regionName);
            if (data.country) parts.push(data.country);
            
            return parts.join(', ') || 'Unknown';
        }
        
        return 'Unknown';
    } catch (error) {
        console.error('Error fetching location from IP:', error);
        return 'Unknown';
    }
}
