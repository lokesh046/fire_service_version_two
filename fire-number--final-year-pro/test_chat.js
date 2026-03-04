const axios = require('axios');

async function testChat() {
    try {
        const response = await axios.post('http://localhost:5006/chat-agent', {
            message: "I earn 300000 per month, spend 20000, have 0 savings, 0 loan."
        });
        console.log(JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}

testChat();
