from fastapi import APIRouter
from typing import List
from .schemas import JobSubmitRequest, JobResultsRequest
from .services import create_submit_file_service, submit_job_service, jobs_state_service, jobs_results_service

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
async def get_state_jobs(submit_container_name: str):
    jobs_state = await jobs_state_service(submit_container_name)
    print(jobs_state)
    return {"jobs": jobs_state}


@router.post("/results")
async def get_jobs_results(jobs_submitted: List[JobResultsRequest]):
    jobs_results = []
    for batch in jobs_submitted:
        job_result = await jobs_results_service(batch.batch_name, batch.output_type)
        jobs_results.append(job_result)
    print(jobs_results)
    return {"results": jobs_results}

