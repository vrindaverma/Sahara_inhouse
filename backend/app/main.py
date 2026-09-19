from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import documents, graph, emergency

app = FastAPI(title="Sahara Core Engine")

app.add_middleware(
    CORSMiddleware,
    # Added http://localhost:5174 and http://127.0.0.1:5174
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(graph.router, prefix="/api/v1/graph", tags=["Graph Analysis"])
app.include_router(emergency.router, prefix="/api/v1/emergency", tags=["Emergency Engine"])