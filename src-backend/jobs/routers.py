from fastapi import APIRouter, Request
from typing import List
from .schemas import JobSubmitRequest, JobResultsRequest, RemoveJobRequest
from .services import create_submit_file_service, submit_job_service, jobs_state_service, jobs_results_service, remove_job_service, remove_batch_service

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
    print(jobs_state)
    return {"jobs": jobs_state}


# results, jobs fnished
@router.post("/results")
async def get_jobs_results(jobs_submitted: List[JobResultsRequest], sub_container_name: str):
    jobs_results = []
    for batch in jobs_submitted:
        job_result = await jobs_results_service(batch.batch_name, batch.universe, batch.submitted, batch.number_jobs, batch.output_type, sub_container_name)
        jobs_results.append(job_result)
    print(jobs_results)
    return {"results": jobs_results}


# remove a job from the queue
@router.post("/queue/remove-job")
async def delete_queue_job(request: RemoveJobRequest):
    response = await remove_job_service(request.job_id, request.submit_container_name)
    print("[JOB REMOVED]", response)
    return response


# remove a batch of jobs
@router.post("/queue/remove-batch")
async def delete_batch(batch_name: str, submit_container_name: str):
    response = await remove_batch_service(batch_name, submit_container_name)
    print("[REMOVE BATCH]", response)
    return response
    