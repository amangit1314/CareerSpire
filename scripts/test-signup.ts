import { signUpAction } from '../app/actions/auth.actions';

async function testSignup() {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Password123!';
    const name = 'Test User';

    console.log('--- Starting Signup Test ---');
    console.log('Testing with:', { email, password, name });

    try {
        const result = await signUpAction({ email, password, name });
        console.log('Signup Action Result:', JSON.stringify(result, null, 2));

        if (result && result.user && result.session) {
            console.log('SUCCESS: Result contains user and session.');
        } else {
            console.log('FAILURE: Result is missing user or session.');
        }

        // Now let's try to find this user in the DB to make sure it was actually created
        // (Note: This requires lib/prisma to work in this script context)
        // For now, checking the returned object is enough to see if it's returning anything.

    } catch (error) {
        console.error('Signup Test ERROR:', error);
    }
}

testSignup();
