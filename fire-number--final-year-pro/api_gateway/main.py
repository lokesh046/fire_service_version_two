"""
API Gateway with Automatic Token Handling via Cookies
After login, all subsequent requests automatically use the stored token
"""

from fastapi import FastAPI, Depends, HTTPException, status, Response, Request, Cookie, Header, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import httpx
import uuid
import os

from shared.services.service_auth import get_current_user, CurrentUser, create_access_token
from shared.services.auth_routes import router as auth_router

from shared.database import get_db, engine, Base
from shared.services.fire_service import save_fire_calculation
from shared.services.health_service import save_health_score
from shared.services.loan_service import save_loan_simulation
import shared.models
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="Wealth To FIRE Gateway (Async)",
    description="API Gateway for Financial Planning Microservices"
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        from sqlalchemy import text
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR;"))
                print("[MIGRATION] Added username column.")
            except Exception:
                pass
            try:
                await conn.execute(text("UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL OR username = '';"))
                print("[MIGRATION] Updated usernames from email.")
            except Exception:
                pass
            try:
                await conn.execute(text("ALTER TABLE users ALTER COLUMN username SET NOT NULL;"))
            except Exception:
                pass
            try:
                await conn.execute(text("ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username);"))
            except Exception:
                pass
        print("[SUCCESS] Database connection established, tables synced, and username migrated.")
    except TimeoutError:
        print("[WARNING] Could not connect to database during startup. Retrying on first request...")
    except Exception as e:
        print(f"[WARNING] Database initialization error: {e}. Retrying on first request...")


def get_token_from_request(authorization: Optional[str] = Header(None), access_token: Optional[str] = Cookie(None)) -> Optional[str]:
    """Get token from Authorization header OR cookie - automatically handles both"""
    if authorization:
        return authorization.replace("Bearer ", "")
    if access_token:
        return access_token
    return None


def get_current_user_from_token(token: Optional[str]) -> Optional[CurrentUser]:
    """Decode token and return user"""
    if not token:
        return None
    
    try:
        from shared.services.service_auth import decode_token
        token_data = decode_token(token)
        
        return CurrentUser(
            id=token_data.user_id or "unknown",
            email=token_data.email or "",
            username=token_data.username or "",
            role=token_data.role or "user",
            tenant_id=token_data.tenant_id
        )
    except Exception:
        return None


class FinanceInput(BaseModel):
    monthly_income: float
    living_expense: float
    current_savings: float
    return_rate: float
    inflation_rate: float
    has_loan: str
    loan_amount: float
    interest_rate_value: float
    rate_type: str
    loan_emi: float = 0
    loan_years: int = 0
    has_insurance: str


class LoanOnlyInput(BaseModel):
    loan_amount: float
    interest_rate_value: float
    rate_type: str
    tenure_years: int


def get_auth_headers(authorization: Optional[str] = Header(None), access_token: Optional[str] = Cookie(None)) -> dict:
    """Get authorization headers - works with header OR cookie"""
    token = get_token_from_request(authorization, access_token)
    if token:
        return {"Authorization": f"Bearer {token}"}
    return {}


def require_auth(authorization: Optional[str] = Header(None), access_token: Optional[str] = Cookie(None)) -> CurrentUser:
    """Dependency that requires authentication - works with header OR cookie"""
    token = get_token_from_request(authorization, access_token)
    user = get_current_user_from_token(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please login first.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return user


# ============================================================
# PUBLIC ENDPOINTS
# ============================================================

@app.get("/")
async def root():
    return {
        "service": "Wealth To FIRE API Gateway",
        "version": "2.0",
        "auth_required": True
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api_gateway"}

@app.post("/dev/promote_to_admin")
async def dev_promote_to_admin(email: str, db_session=Depends(get_db)):
    from sqlalchemy import text
    try:
        result = await db_session.execute(
            text("UPDATE users SET role = 'admin' WHERE email = :email RETURNING id"),
            {"email": email}
        )
        updated_id = result.scalar()
        await db_session.commit()
        if updated_id:
            return {"message": f"Successfully promoted {email} to admin!"}
        else:
            return {"error": f"User {email} not found."}
    except Exception as e:
        await db_session.rollback()
        return {"error": str(e)}

# ============================================================
# EXPLAIN SERVICE ADMIN PROXIES (RAG DB)
# ============================================================

EXPLAIN_SERVICE_URL = "http://localhost:8005"
# The backend explain service requires an ADMIN_API_KEY header.
EXPLAIN_ADMIN_KEY = os.getenv("ADMIN_API_KEY", "super_secret_key_change_me")

@app.post("/admin/upload")
async def admin_upload_gateway(
    file: UploadFile = File(...),
    user: CurrentUser = Depends(require_auth)
):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        file_bytes = await file.read()
        async with httpx.AsyncClient() as client:
            # We need to forward the file to the explain service as multipart/form-data
            files = {'file': (file.filename, file_bytes, file.content_type)}
            headers = {"api-key": EXPLAIN_ADMIN_KEY}
            
            response = await client.post(
                f"{EXPLAIN_SERVICE_URL}/admin/upload",
                files=files,
                headers=headers,
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Downstream error: {response.text}"
                )
            return response.json()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/admin/delete")
async def admin_delete_gateway(
    source: str,
    user: CurrentUser = Depends(require_auth)
):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
        
    async with httpx.AsyncClient() as client:
        headers = {"api-key": EXPLAIN_ADMIN_KEY}
        
        response = await client.delete(
            f"{EXPLAIN_SERVICE_URL}/admin/delete",
            params={"source": source},
            headers=headers,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Downstream error: {response.text}"
            )
        return response.json()

# ============================================================
# CHAT AGENT ENDPOINT
# ============================================================

class ChatMessage(BaseModel):
    role: str
    content: str
    
class ChatRequest(BaseModel):
    message: str
    history: Optional[list[ChatMessage]] = None
    state: Optional[dict] = None


@app.post("/chat-agent")
async def chat_agent(
    data: ChatRequest,
    user: CurrentUser = Depends(require_auth),
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None),
    db_session = Depends(get_db),
):
    """Chat with AI Financial Advisor"""
    headers = get_auth_headers(authorization, access_token)

    async with httpx.AsyncClient() as client:
        try:
            payload = {"message": data.message}
            if data.history is not None:
                payload["history"] = [h.dict() for h in data.history]
            if data.state is not None:
                payload["state"] = data.state
                
            response = await client.post(
                "http://localhost:5006/chat-agent",  # Chat service on port 5006
                json=payload,
                headers=headers,
                timeout=60.0
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Save FIRE calculation if exists
                if result.get("state", {}).get("fire_number"):
                    try:
                        await save_fire_calculation(
                            db=db_session,
                            user_id=uuid.UUID(user.id),
                            monthly_income=result["state"].get("monthly_income", 0),
                            living_expense=result["state"].get("living_expense", 0),
                            current_savings=result["state"].get("current_savings", 0),
                            fire_number=result["state"].get("fire_number", 0),
                            fire_year=result["state"].get("fire_year", 0),
                            final_wealth=result["state"].get("final_wealth", 0)
                        )
                    except Exception as e:
                        print(f"Error saving fire: {e}")
                
                return result
            else:
                return {"error": "Chat service failed", "details": response.text}
                
        except Exception as e:
            return {"error": "Chat service unavailable", "details": str(e)}


# ============================================================
# PROTECTED ENDPOINTS - Auto-auth via cookie or header
# ============================================================

@app.post("/calculate-fire")
async def calculate_fire(
    data: FinanceInput,
    user: CurrentUser = Depends(require_auth),
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None),
    db_session = Depends(get_db)
):
    """
    Calculate FIRE - works with token in header OR cookie
    After login, just call this endpoint - token is automatic!
    """
    headers = get_auth_headers(authorization, access_token)

    async with httpx.AsyncClient() as client:

        fire_response = await client.post(
            "http://localhost:8001/fire",
            json=data.dict(),
            headers=headers,
            timeout=30.0
        )

        if fire_response.status_code != 200:
            print("FIRE SERVICE FAILED:", fire_response.text)
            return {"error": "FIRE service failed", "details": fire_response.text}

        fire_data = fire_response.json()
        print("FIRE SERVICE SUCCESS:", fire_data)

        health_response = await client.post(
            "http://localhost:8002/health-score",
            json={
                "monthly_income": data.monthly_income,
                "living_expense": data.living_expense,
                "loan_emi": data.loan_emi,
                "current_savings": data.current_savings,
                "fire_number": fire_data["fire_number"],
                "has_insurance": data.has_insurance
            },
            headers=headers,
            timeout=30.0
        )

        if health_response.status_code != 200:
            return {"error": "Health service failed", "details": health_response.text}

        health_data = health_response.json()

    # Save FIRE calculation to database
    try:
        await save_fire_calculation(
            db=db_session,
            user_id=uuid.UUID(user.id),
            monthly_income=data.monthly_income,
            living_expense=data.living_expense,
            current_savings=data.current_savings,
            fire_number=fire_data["fire_number"],
            fire_year=fire_data["fire_year"],
            final_wealth=fire_data["final_wealth"]
        )
    except Exception as e:
        print(f"Error saving fire calculation: {e}")

    # Save Health score to database
    try:
        debt_ratio = data.loan_emi / data.monthly_income if data.monthly_income > 0 else 0
        savings_ratio = data.current_savings / data.monthly_income if data.monthly_income > 0 else 0
        
        await save_health_score(
            db=db_session,
            user_id=uuid.UUID(user.id),
            score=health_data["financial_health_score"],
            fire_number=fire_data["fire_number"],
            debt_ratio=debt_ratio,
            savings_ratio=savings_ratio
        )
    except Exception as e:
        print(f"Error saving health score: {e}")

    return {
        "fire_number": fire_data["fire_number"],
        "fire_year": fire_data["fire_year"],
        "final_wealth": fire_data["final_wealth"],
        "financial_health_score": health_data["financial_health_score"],
        "user_id": user.id,
        "saved": True
    }


@app.post("/loan-fire-strategy")
async def compare_loan_vs_fire(
    data: FinanceInput,
    user: CurrentUser = Depends(require_auth),
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None),
    db_session = Depends(get_db)
):
    """Compare loan vs FIRE strategy - automatic auth"""
    headers = get_auth_headers(authorization, access_token)

    async with httpx.AsyncClient() as client:

        # Calculate current FIRE
        fire_current = await client.post(
            "http://localhost:8001/fire",
            json=data.dict(),
            headers=headers,
            timeout=30.0
        )

        if fire_current.status_code != 200:
            return {"error": "FIRE service failed", "details": fire_current.text}

        fire_current_data = fire_current.json()
        current_year = fire_current_data.get("fire_year", 0)

        if data.has_loan == "no" or data.loan_amount <= 0:
            loan_data = {}
            recommended_emi = 0
            optimized_year = current_year
            strategy = "no_loan"
            fire_optimized_data = fire_current_data
        else:
            # Calculate loan
            loan_response = await client.post(
                "http://localhost:8004/loan-analysis",
                json={
                    "loan_amount": data.loan_amount,
                    "interest_rate_value": data.interest_rate_value,
                    "rate_type": "annual",
                    "tenure_years": data.loan_years or 1
                },
                headers=headers,
                timeout=30.0
            )

            if loan_response.status_code != 200:
                print("FAILED LOAN RES", loan_response.text)
                return {"error": "Loan service failed", "details": loan_response.text}

            loan_data = loan_response.json()
            recommended_emi = loan_data.get("optimal_emi_suggestions", {}).get("recommended_option", {}).get("emi", 0)

            # Calculate optimized FIRE with recommended EMI
            modified_data = data.dict()
            modified_data["loan_emi"] = recommended_emi

            fire_optimized = await client.post(
                "http://localhost:8001/fire",
                json=modified_data,
                headers=headers,
                timeout=30.0
            )

            if fire_optimized.status_code != 200:
                return {"error": "FIRE service failed", "details": fire_optimized.text}

            fire_optimized_data = fire_optimized.json()
            optimized_year = fire_optimized_data.get("fire_year", 0)
            
            # Extract integers to compare
            curr_y = current_year if isinstance(current_year, (int, float)) else 999
            opt_y = optimized_year if isinstance(optimized_year, (int, float)) else 999
            
            strategy = (
                "increase_emi"
                if opt_y < curr_y and opt_y > 0
                else "keep_current_emi"
            )

        # Calculate actual health score to pass to explain service
        health_score = 70.0
        try:
            health_response = await client.post(
                "http://localhost:8002/health-score",
                json={
                    "monthly_income": data.monthly_income,
                    "living_expense": data.living_expense,
                    "loan_emi": recommended_emi if strategy == "increase_emi" else data.loan_emi,
                    "current_savings": data.current_savings,
                    "fire_number": fire_optimized_data.get("fire_number", 0),
                    "has_insurance": data.has_insurance
                },
                headers=headers,
                timeout=10.0
            )
            if health_response.status_code == 200:
                health_score = health_response.json().get("financial_health_score", 70.0)
        except Exception as e:
            print("Error fetching health score for explanation:", e)
            
        # Try explain service (optional)
        ai_explanation = {}
        try:
            explain_response = await client.post(
                f"{EXPLAIN_SERVICE_URL}/explain-strategy",
                json={
                    "context_type": "loan_fire_strategy",
                    "current_fire_year": current_year,
                    "optimized_fire_year": optimized_year,
                    "recommended_emi": recommended_emi,
                    "strategy_recommendation": strategy,
                    "financial_health_score": health_score
                },
                headers=headers,
                timeout=30.0
            )
            
            if explain_response.status_code == 200:
                ai_explanation = explain_response.json()
        except Exception:
            pass  # Ignore if explain service is not available

    # Save FIRE calculations
    try:
        if fire_current_data.get("status") == "success":
            await save_fire_calculation(
                db=db_session,
                user_id=uuid.UUID(user.id),
                monthly_income=data.monthly_income,
                living_expense=data.living_expense,
                current_savings=data.current_savings,
                fire_number=fire_current_data.get("fire_number", 0),
                fire_year=fire_current_data.get("fire_year", 0),
                final_wealth=fire_current_data.get("final_wealth", 0)
            )
    except Exception as e:
        print(f"Error saving fire: {e}")

    return {
        "current_fire_year": current_year,
        "optimized_fire_year": optimized_year,
        "recommended_emi": recommended_emi,
        "strategy_recommendation": strategy,
        "ai_explanation": ai_explanation,
        "loan_details": {
            "original_emi": data.loan_emi,
            "optimal_emi": recommended_emi,
            "interest_savings": loan_data.get("total_interest_paid", 0) - loan_data.get("optimal_emi_suggestions", {}).get("recommended_option", {}).get("total_interest_paid", 0)
        },
        "user_id": user.id
    }


@app.post("/loan-only")
async def loan_only(
    data: LoanOnlyInput,
    user: CurrentUser = Depends(require_auth),
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None)
):
    """Loan analysis - automatic auth"""
    headers = get_auth_headers(authorization, access_token)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8004/loan-analysis",
            json=data.dict(),
            headers=headers,
            timeout=30.0
        )
        return response.json()


@app.get("/me")
async def get_current_user_info(
    user: CurrentUser = Depends(require_auth)
):
    """Get current user info - automatic auth"""
    return {
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role
    }


@app.get("/fire/history")
async def get_fire_history(
    user: CurrentUser = Depends(require_auth),
    db_session = Depends(get_db)
):
    """Get fire calculation history from database"""
    from sqlalchemy import select
    from shared.models import FireCalculation
    
    result = await db_session.execute(
        select(FireCalculation)
        .where(FireCalculation.user_id == uuid.UUID(user.id))
        .order_by(FireCalculation.created_at.desc())
        .limit(10)
    )
    
    records = result.scalars().all()
    
    return {
        "calculations": [
            {
                "fire_number": r.fire_number,
                "fire_year": r.fire_year,
                "final_wealth": r.final_wealth,
                "monthly_income": r.monthly_income,
                "living_expense": r.living_expense,
                "current_savings": r.current_savings,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in records
        ],
        "count": len(records)
    }


@app.get("/health/history")
async def get_health_history(
    user: CurrentUser = Depends(require_auth),
    db_session = Depends(get_db)
):
    """Get health score history from database"""
    from sqlalchemy import select
    from shared.models import HealthScore
    
    result = await db_session.execute(
        select(HealthScore)
        .where(HealthScore.user_id == uuid.UUID(user.id))
        .order_by(HealthScore.created_at.desc())
        .limit(10)
    )
    
    records = result.scalars().all()
    
    return {
        "scores": [
            {
                "score": r.score,
                "fire_number": r.fire_number,
                "debt_ratio": r.debt_ratio,
                "savings_ratio": r.savings_ratio,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in records
        ],
        "count": len(records)
    }


@app.post("/logout")
async def logout(response: Response):
    """Clear auth cookie"""
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}


# ============================================================
# SERVICE-SPECIFIC ENDPOINTS (Direct access)
# ============================================================

@app.post("/fire")
async def fire_direct(
    data: FinanceInput,
    user: CurrentUser = Depends(require_auth),
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None),
    db_session = Depends(get_db)
):
    """Direct FIRE calculation - saves to database"""
    headers = get_auth_headers(authorization, access_token)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8001/fire",
            json=data.dict(),
            headers=headers,
            timeout=30.0
        )
        
        if response.status_code == 200:
            fire_data = response.json()
            
            # Only save if successful
            if fire_data.get("status") == "success" and fire_data.get("fire_year", 0) > 0:
                try:
                    await save_fire_calculation(
                        db=db_session,
                        user_id=uuid.UUID(user.id),
                        monthly_income=data.monthly_income,
                        living_expense=data.living_expense,
                        current_savings=data.current_savings,
                        fire_number=fire_data.get("fire_number", 0),
                        fire_year=fire_data.get("fire_year", 0),
                        final_wealth=fire_data.get("final_wealth", 0)
                    )
                except Exception as e:
                    print(f"Error saving fire calculation: {e}")
            
            # Also calculate and save health score if successful
            if fire_data.get("status") == "success":
                try:
                    health_response = await client.post(
                        "http://localhost:8002/health-score",
                        json={
                            "monthly_income": data.monthly_income,
                            "living_expense": data.living_expense,
                            "loan_emi": data.loan_emi,
                            "current_savings": data.current_savings,
                            "fire_number": fire_data.get("fire_number", 0),
                            "has_insurance": data.has_insurance
                        },
                        headers=headers,
                        timeout=30.0
                    )
                    
                    if health_response.status_code == 200:
                        health_data = health_response.json()
                        debt_ratio = data.loan_emi / data.monthly_income if data.monthly_income > 0 else 0
                        savings_ratio = data.current_savings / data.monthly_income if data.monthly_income > 0 else 0
                        
                        await save_health_score(
                            db=db_session,
                            user_id=uuid.UUID(user.id),
                            score=health_data.get("financial_health_score", 0),
                            fire_number=fire_data.get("fire_number", 0),
                            debt_ratio=debt_ratio,
                            savings_ratio=savings_ratio
                        )
                except Exception as e:
                    print(f"Error saving health score: {e}")
        
        return response.json()


@app.post("/health")
async def health_direct(
    data: FinanceInput,
    user: CurrentUser = Depends(require_auth),
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None)
):
    """Direct health score calculation"""
    headers = get_auth_headers(authorization, access_token)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8002/health-score",
            json={
                "monthly_income": data.monthly_income,
                "living_expense": data.living_expense,
                "loan_emi": data.loan_emi,
                "current_savings": data.current_savings,
                "fire_number": 1500000,
                "has_insurance": data.has_insurance
            },
            headers=headers,
            timeout=30.0
        )
        return response.json()


@app.post("/loan")
async def loan_direct(
    data: LoanOnlyInput,
    user: CurrentUser = Depends(require_auth),
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None),
    db_session = Depends(get_db)
):
    """Direct loan analysis - saves to database"""
    headers = get_auth_headers(authorization, access_token)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8004/loan-analysis",
            json=data.dict(),
            headers=headers,
            timeout=30.0
        )
        
        if response.status_code == 200:
            loan_data = response.json()
            
            # Save to database
            try:
                recommended = loan_data.get("optimal_emi_suggestions", {}).get("recommended_option", {})
                await save_loan_simulation(
                    db=db_session,
                    user_id=uuid.UUID(user.id),
                    loan_amount=data.loan_amount,
                    interest_rate=data.interest_rate_value,
                    tenure_years=data.tenure_years,
                    optimal_emi=recommended.get("emi", loan_data.get("calculated_emi", 0)),
                    total_interest=loan_data.get("total_interest_paid", 0)
                )
            except Exception as e:
                print(f"Error saving loan simulation: {e}")
        
        return response.json()


@app.get("/loan/history")
async def get_loan_history(
    user: CurrentUser = Depends(require_auth),
    db_session = Depends(get_db)
):
    """Get loan simulation history from database"""
    from sqlalchemy import select
    from shared.models import LoanSimulation
    
    result = await db_session.execute(
        select(LoanSimulation)
        .where(LoanSimulation.user_id == uuid.UUID(user.id))
        .order_by(LoanSimulation.created_at.desc())
        .limit(10)
    )
    
    records = result.scalars().all()
    
    return {
        "simulations": [
            {
                "loan_amount": r.loan_amount,
                "interest_rate": r.interest_rate,
                "tenure_years": r.tenure_years,
                "optimal_emi": r.optimal_emi,
                "total_interest": r.total_interest,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in records
        ],
        "count": len(records)
    }


@app.get("/dashboard")
async def get_dashboard(
    user: CurrentUser = Depends(require_auth),
    db_session = Depends(get_db)
):
    """Get user dashboard with all financial data"""
    from sqlalchemy import select
    from shared.models import FireCalculation, HealthScore, LoanSimulation
    
    # Get latest FIRE calculation
    fire_result = await db_session.execute(
        select(FireCalculation)
        .where(FireCalculation.user_id == uuid.UUID(user.id))
        .order_by(FireCalculation.created_at.desc())
        .limit(1)
    )
    latest_fire = fire_result.scalar_one_or_none()
    
    # Get latest health score
    health_result = await db_session.execute(
        select(HealthScore)
        .where(HealthScore.user_id == uuid.UUID(user.id))
        .order_by(HealthScore.created_at.desc())
        .limit(1)
    )
    latest_health = health_result.scalar_one_or_none()
    
    # Get loan count
    loan_result = await db_session.execute(
        select(LoanSimulation)
        .where(LoanSimulation.user_id == uuid.UUID(user.id))
        .order_by(LoanSimulation.created_at.desc())
    )
    loans = loan_result.scalars().all()
    
    return {
        "user": {
            "id": user.id,
            "email": user.email
        },
        "fire": {
            "fire_number": latest_fire.fire_number if latest_fire else None,
            "fire_year": latest_fire.fire_year if latest_fire else None,
            "final_wealth": latest_fire.final_wealth if latest_fire else None,
            "monthly_income": latest_fire.monthly_income if latest_fire else None,
            "current_savings": latest_fire.current_savings if latest_fire else None,
            "last_updated": latest_fire.created_at.isoformat() if latest_fire and latest_fire.created_at else None
        } if latest_fire else None,
        "health": {
            "score": latest_health.score if latest_health else None,
            "debt_ratio": latest_health.debt_ratio if latest_health else None,
            "savings_ratio": latest_health.savings_ratio if latest_health else None,
            "last_updated": latest_health.created_at.isoformat() if latest_health and latest_health.created_at else None
        } if latest_health else None,
        "loans": {
            "total_simulations": len(loans),
            "latest_loan": {
                "loan_amount": loans[0].loan_amount if loans else None,
                "optimal_emi": loans[0].optimal_emi if loans else None,
                "total_interest": loans[0].total_interest if loans else None
            } if loans else None
        }
    }
