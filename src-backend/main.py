from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from lan_ssh.routers import router as ssh_router
from resources.routers import router as resources_router
from cluster.routers import router as cluster_router
from containers.routers import router as containers_router
from htcondor.routers import router as htcondor_router
from jobs.routers import router as jobs_router
from user_data.routers import router as user_auth_router
from core.database import Base, engine

app = FastAPI()

origins = [
    "http://localhost:1420",  # front
]

app.add_middleware(
    CORSMiddleware,
    #allow_origins=origins,
    allow_origins=["*"],
    #allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# routes of the modules
app.include_router(ssh_router, prefix="/lan-ssh", tags=["LAN SSH"])
app.include_router(resources_router, prefix="/resources", tags=["RESOURCES"])
app.include_router(containers_router, prefix="/containers", tags=["CONTAINERS"])
app.include_router(cluster_router, prefix="/cluster", tags=["CLUSTER"])
app.include_router(htcondor_router, prefix="/htc", tags=["HTCONDOR"])
app.include_router(jobs_router, prefix="/jobs", tags=["JOBS"])
app.include_router(user_auth_router, prefix="/user", tags=["USER SESSION"])