import shutil
from fastapi import APIRouter, Request, File, Form, UploadFile, HTTPException, status
from fastapi.responses import FileResponse
from typing import List
from .schemas import JobSubmitRequest, JobResultsRequest, RemoveJobRequest, JobData
from .services import create_submit_file_service, submit_job_service, jobs_state_service, jobs_results_service, remove_job_service, remove_batch_service
import json, shutil, os
import tempfile

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
            dest_path = os.path.join(working_directory, f"{file.filename}")
            with open(dest_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

    # update files list to transfer
    if files:
        job_dict["transfer_input_files"] = ",".join(
            [f"{file.filename}" for file in files]
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


@router.get("/download-results/{batch_name}")
async def download_results(batch_name: str, output_type: str):
    """
    zips job finished results depnding on an output_type selected by the user and returns
    them as a .zip file downloable
    """
    print(f"Descargando resultados de {batch_name} con tipo {output_type}")
    base_dir = os.path.expanduser("~/sideger-jobs")

    result_dirs = [
        os.path.join(base_dir, d)
        for d in os.listdir(base_dir)
        if d.startswith(f"{batch_name}_resultados_") and os.path.isdir(os.path.join(base_dir, d))
    ]

    if not result_dirs:
        raise HTTPException(status_code=404, detail=f"No results found for: {batch_name}")

    # verify the output type to prepare the .zip
    to_compress = []
    for result_dir in result_dirs:
        if output_type == "a_directory":
            to_compress.append(result_dir)
        elif output_type == "n_directories":
            # subdirectories (run_0, run_1, etc.)
            subdirs = [
                os.path.join(result_dir, d)
                for d in os.listdir(result_dir)
                if os.path.isdir(os.path.join(result_dir, d))
            ]
            to_compress.extend(subdirs)
        else:
            raise HTTPException(status_code=400, detail=f"Unrecognized output type: {output_type}")

    if not to_compress:
        raise HTTPException(status_code=404, detail="No archives found to zip")

    # temporal zip
    import tempfile, shutil
    temp_dir = tempfile.mkdtemp()
    zip_path = os.path.join(temp_dir, f"{batch_name}_resultados.zip")

    if len(to_compress) == 1:
        shutil.make_archive(zip_path[:-4], "zip", to_compress[0])
    else:
        temp_group = os.path.join(temp_dir, f"{batch_name}_grouped")
        os.makedirs(temp_group, exist_ok=True)
        for d in to_compress:
            shutil.copytree(d, os.path.join(temp_group, os.path.basename(d)))
        shutil.make_archive(zip_path[:-4], "zip", temp_group)

    return FileResponse(
        path=zip_path,
        filename=f"{batch_name}_resultados.zip",
        media_type="application/zip",
    )