from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import configure_cors
from lan_ssh.routers import router as ssh_router
from resources.routers import router as resources_router
from cluster.routers import router as cluster_router
from containers.routers import router as containers_router
from htcondor.routers import router as htcondor_router

app = FastAPI()
configure_cors(app)

# routes of the modules
app.include_router(ssh_router, prefix="/lan-ssh", tags=["LAN SSH"])
app.include_router(resources_router, prefix="/resources", tags=["RESOURCES"])
app.include_router(containers_router, prefix="/containers", tags=["CONTAINERS"])
app.include_router(cluster_router, prefix="/cluster", tags=["CLUSTER"])
app.include_router(htcondor_router, prefix="/htc", tags=["HTCONDOR"])