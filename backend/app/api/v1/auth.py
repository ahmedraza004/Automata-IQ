from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.models.user import User, Tenant
from app.models.audit import AuditLog
from app.schemas.auth import UserCreate, UserLogin, TokenResponse, TokenRefreshRequest, UserRead
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Get or create tenant
    tenant = None
    if user_in.tenant_name:
        tenant = db.query(Tenant).filter(Tenant.name == user_in.tenant_name).first()
        if not tenant:
            tenant = Tenant(name=user_in.tenant_name, slug=user_in.tenant_name.lower().replace(" ", "-"))
            db.add(tenant)
            db.flush()

    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role or "operator",
        tenant_id=tenant.id if tenant else None,
        avatar_url=user_in.avatar_url
    )
    db.add(user)
    db.flush()

    # Log audit
    audit = AuditLog(
        tenant_id=user.tenant_id,
        action="user.registered",
        actor_type="user",
        actor_id=user.id,
        actor_email=user.email,
        entity_type="user",
        entity_id=user.id,
        payload={"email": user.email, "role": user.role}
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id, extra_claims={"role": user.role, "tenant_id": user.tenant_id})
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserRead.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    access_token = create_access_token(user.id, extra_claims={"role": user.role, "tenant_id": user.tenant_id})
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserRead.model_validate(user)
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(req: TokenRefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    access_token = create_access_token(user.id, extra_claims={"role": user.role, "tenant_id": user.tenant_id})
    refresh_token_new = create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_new,
        token_type="bearer",
        user=UserRead.model_validate(user)
    )


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return UserRead.model_validate(current_user)
