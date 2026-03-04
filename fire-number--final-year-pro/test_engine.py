from fire_service.fire_engine import calculate_fire_plan

result = calculate_fire_plan(
    monthly_income=300000,
    living_expense=20000,
    current_savings=0,
    return_rate=0.10,
    inflation_rate=0.06,
    has_loan=False,
    loan_emi=0,
    loan_years=0
)
print("Result of pure calculation:")
print(result)
