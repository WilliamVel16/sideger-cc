from fastapi import APIRouter, Request
from typing import List
from .schemas import JobSubmitRequest, JobResultsRequest
from .services import create_submit_file_service, submit_job_service, jobs_state_service, jobs_results_service

router = APIRouter()

# submit a job to the cluster
@router.post("/submit")
async def submit_job(request: JobSubmitRequest):
    job = request.job_data
    submit_container_name = request.submit_role_container_name
    output_type = request.output_type
    
    filename_classad = create_submit_file_service(job, output_type)

    output = submit_job_service(filename_classad, submit_container_name)
    return {"message": "job received", "output": output}


# queue state (jobs in the htcondor queue) 
@router.post("/data/queue")
async def get_state_jobs(submit_container_name: str, request: Request):
    body = await request.json()
    session_jobs = body.get("session_jobs", [])
    jobs_state = await jobs_state_service(submit_container_name, session_jobs)
    return {"jobs": jobs_state}


# results, jobs fnished
@router.post("/results")
async def get_jobs_results(jobs_submitted: List[JobResultsRequest], sub_container_name: str):
    jobs_results = []
    for batch in jobs_submitted:
        job_result = await jobs_results_service(batch.batch_name, batch.number_jobs, batch.output_type, sub_container_name)
        jobs_results.append(job_result)
    return {"results": jobs_results}


# luego la lógica para guardar el trabajo
