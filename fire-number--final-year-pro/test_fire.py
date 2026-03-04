import asyncio
from chat_service.financial_state import FinancialState
from chat_service.planner import Planner
from chat_service.execution_engine import ExecutionEngine

async def test_flow():
    state = FinancialState()
    state.monthly_income = 300000
    state.living_expense = 20000
    state.current_savings = 0
    state.return_rate = 0.10
    state.inflation_rate = 0.06
    state.has_loan = False
    
    planner = Planner()
    tools = await planner.create_plan(state)
    print("Planned tools:", tools)
    
    executor = ExecutionEngine()
    # Call with no token just to trigger the local endpoints without auth issues if they don't require it in direct tool executor
    state, results = await executor.execute_chain(tools, state, auth_token=None)
    
    print("Final State FIRE Number:", state.fire_number)
    print("Final State Health Score:", state.financial_health_score)
    print("Result Dicts:", results)
    
if __name__ == "__main__":
    asyncio.run(test_flow())
