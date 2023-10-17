// Encryption and Decryption Functions
async function encryptMessage(message, key) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);

        // Generate a random IV
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Encrypt the data with the IV
        const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

        // Combine the IV and ciphertext into a single Uint8Array
        const encryptedMessage = new Uint8Array(iv.length + encryptedData.byteLength);
        encryptedMessage.set(iv, 0);
        encryptedMessage.set(new Uint8Array(encryptedData), iv.length);

        // Log the original message and encrypted message
        console.log("Original message: " + message);
        console.log("Encrypted message: " + encryptedMessage);

        return encryptedMessage;
    } catch (error) {
        console.error("Encryption error:", error);
        throw error; // Rethrow the error so it can be caught by the calling code.
    }
}

async function decryptMessage(encryptedData, key) {
    const iv = encryptedData.slice(0, 12); // Extract the IV from the beginning of the encrypted data.
    const ciphertext = encryptedData.slice(12);

    const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

    const decoder = new TextDecoder();
    const decryptedMessage = decoder.decode(decryptedData);

    // Log the decrypted message
    console.log("Decrypted message: " + decryptedMessage);

    return decryptedMessage;
}

// Generate a cryptographic key
async function generateKey() {
    return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

let encryptionKey;

// Function to send a message
async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const receivedMessages = document.getElementById('received-messages');

    const message = messageInput.value;
    messageInput.value = '';

    if (!encryptionKey) {
        encryptionKey = await generateKey();
    }

    const encryptedMessage = await encryptMessage(message, encryptionKey);

    // Display the received message
    const receivedMessage = document.createElement('div');
    receivedMessage.textContent = await decryptMessage(encryptedMessage, encryptionKey);
    receivedMessages.appendChild(receivedMessage);
}

