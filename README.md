import { signActionPayload } from './signActionPayload';

// Example payload to sign
const actionPayload = {
    actionType: 'transfer',
    amount: 500,
    destination: 'G7huw9ZxyV6HX...Xnb6Vhvqpk',
};

// Assuming `window.solana` is the Phantom wallet provider
async function signActionExample() {
    const wallet = window.solana;

    if (!wallet.isConnected) {
        await wallet.connect(); // Request wallet connection
    }

    try {
        const signedAction = await signActionPayload(actionPayload, wallet);

        console.log('Signed Action:', signedAction);
        /**
         * Output:
         * {
         *   payload: { actionType: 'transfer', amount: 500, destination: '...' },
         *   signature: '...',
         *   publicKey: '...',
         * }
         */
    } catch (error) {
        console.error('Error signing action:', error.message);
    }
}

signActionExample();
