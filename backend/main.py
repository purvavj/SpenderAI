from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, transactions, dashboard

app = FastAPI(title="Finance App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root test route
@app.get("/")
def read_root():
    return {"message": "Welcome to Spender App Backend"}

# Mount routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(transactions.router, prefix="/api", tags=["Transactions"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])