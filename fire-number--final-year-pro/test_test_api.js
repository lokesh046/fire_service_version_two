const axios = require('axios');

async function testApis() {
    try {
        const payload = {
            monthly_income: 300000,
            living_expense: 20000,
            current_savings: 0,
            return_rate: 0.10,
            inflation_rate: 0.06,
            has_loan: "no",
            loan_emi: 0,
            loan_years: 0,
            loan_amount: 0,
            interest_rate_value: 0,
            rate_type: "annual",
            has_insurance: "yes"
        };
        console.log("Testing Internal FIRE service directly...");
        const fireRes = await axios.post('http://localhost:8001/fire', payload);
        console.log(fireRes.data);

        console.log("\nTesting Internal Health score directly...");
        payload.fire_number = fireRes.data.fire_number;
        const healthRes = await axios.post('http://localhost:8002/health-score', payload);
        console.log(healthRes.data);
    } catch (e) {
        console.error("FAIL:", e.response ? e.response.data : e.message);
    }
}

testApis();
