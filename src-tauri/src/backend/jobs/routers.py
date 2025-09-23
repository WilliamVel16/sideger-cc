from fastapi import APIRouter
from .schemas import JobSubmitRequest, SubmitContainer
from .services import create_submit_file_service, submit_job_service, jobs_state_service

router = APIRouter()

@router.post("/submit")
async def submit_job(request: JobSubmitRequest):
    job = request.job_data
    submit_container_name = request.submit_role_container_name
    output_type = request.output_type
    
    filename_classad = create_submit_file_service(job, output_type)

    output = submit_job_service(filename_classad, submit_container_name)
    return {"message": "job received", "output": output}


@router.get("/queue")
async def get_state_jobs(request: SubmitContainer):
    jobs_state = await jobs_state_service(request.submit_container_name)
    print(jobs_state)
    return {"jobs": jobs_state}