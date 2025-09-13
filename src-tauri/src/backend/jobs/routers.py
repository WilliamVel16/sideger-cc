from fastapi import APIRouter
from .schemas import JobData
from .services import submit_job_service

router = APIRouter()

@router.post("/submit")
async def submit_job(job: JobData):
    result = submit_job_service(job)
    return {"message": "job received", **result}
