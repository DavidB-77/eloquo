const { ConvexHttpClient } = require('convex/browser');
require('dotenv').config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.CONVEX_SELF_HOSTED_URL);

async function main() {
    try {
        await client.mutation('profiles:updateAdminStatus', {
            userId: '4145d0d5-46dd-433a-9948-77b88b386aec', // dcdgllc14@gmail.com
            isAdmin: true
        });
        console.log('Successfully updated 4145d0d5-46dd-433a-9948-77b88b386aec to Admin');

        // Also check dj.blaney77@gmail.com
        await client.mutation('profiles:updateAdminStatus', {
            userId: 'c93a4854-dce8-4339-860a-992bb6ff41bc',
            isAdmin: true
        });
        console.log('Successfully updated c93a4854-dce8-4339-860a-992bb6ff41bc to Admin');

    } catch (e) {
        console.error('Error updating admin status:', e);
    }
}

main();
