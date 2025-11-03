import shutil
from fastapi import APIRouter, Request, File, Form, UploadFile
from typing import List
from .schemas import JobSubmitRequest, JobResultsRequest, RemoveJobRequest, JobData
from .services import create_submit_file_service, submit_job_service, jobs_state_service, jobs_results_service, remove_job_service, remove_batch_service
import json, shutil, os

router = APIRouter()

# submit a job to the cluster
@router.post("/submit")
async def submit_job(
    job_data: str = Form(...),
    submit_role_container_name: str = Form(...),
    output_type: str = Form(...),
    files: list[UploadFile] = File(None)):

    job_dict = json.loads(job_data)
    job_name = job_dict.get("batch_name")

    working_directory = os.path.expanduser("~/sideger-jobs")
    os.makedirs(working_directory, exist_ok=True)

    # save job files
    if files:
        for file in files:
            dest_path = os.path.join(working_directory, f"{job_name}_{file.filename}")
            with open(dest_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

    # update files list to transfer
    if files:
        job_dict["transfer_input_files"] = ",".join(
            [f"{job_name}_{file.filename}" for file in files]
        )

    # generates classAd (.sub)
    job = JobData(**job_dict)
    filename_classad = create_submit_file_service(job, output_type)

    # executes condor_submit into the submit node (container)
    output = submit_job_service(filename_classad, submit_role_container_name)
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
    