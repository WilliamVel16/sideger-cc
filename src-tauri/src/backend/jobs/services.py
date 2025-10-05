import os
import asyncio
import subprocess
import json
from fastapi import HTTPException
from pathlib import Path
from .submit_builder import HTCondorSubmit
from .schemas import JobData
import asyncio, json
from datetime import timedelta
from .utils import summarize_jobs, build_results_a_directory, build_results_n_directories

def create_submit_file_service(job: JobData, output_type: str):
    """
    permits to create the submit file (or classad) to save it in the
    sideger-jobs directory (shared volume).
    Identifies the job and output type to create his respective class_ad.
    """
    class_ad = job.model_dump()
    job_name = class_ad.get("batch_name")

    working_directory = os.path.expanduser("~/sideger-jobs")
    os.makedirs(working_directory, exist_ok=True)
    os.makedirs(os.path.join(working_directory, f"{job_name}_logs"), exist_ok=True)

    if output_type == "a_directory": 
        class_ad["output"] = f"{job_name}_resultados_$(Cluster)/run_$(Process).out"
        class_ad["error"] = f"{job_name}_errors/error_run_$(Process).err"
        class_ad["log"] = f"{job_name}_logs/trabajo_$(process).log"
    elif output_type == "n_directories":
        class_ad["output"] = f"{job_name}_resultados_$(Cluster)/run_$(Process)/salida.out" # temp filename.out
        class_ad["error"] = f"{job_name}_errors/error_run_$(Process).err"
        class_ad["log"] = f"{job_name}_logs/trabajo_$(process).log"
    else:
        raise ValueError(f"[ERR] in create submit file: Unknown output_type {output_type}")
    
    class_ad["should_transfer_files"] = "YES"
    class_ad["when_to_transfer_output"] = "ON_EXIT"

    filename = f"{job_name}.sub"
    full_path = os.path.join(working_directory, filename)
    
    # constructor HTCondor Submit file
    class_ad = HTCondorSubmit(**class_ad)
    class_ad.save(full_path)
    return filename


def submit_job_service(filename_sub_classad: str, sub_container_name: str):
    '''
    permits send a job to HTCondor after that classAd file is build
    params:
    - filename_sub_classad, the name of the submit file (classAd) created
    - sub_container_name, the name of the container with role 'sub'
    '''
    command = f"docker exec -w /sideger-jobs {sub_container_name} sh -c 'condor_submit {filename_sub_classad}'"
    try: 
        output = subprocess.run(
            ["bash", "-c", command],
            capture_output=True,
            check=False,
            text=True
        )
        print(output.stdout)
        print(output.stderr)

        if output.returncode == 0:
            return f"[OK] in submit job: {output.stdout}"
        else:
            raise RuntimeError(f"[ERR] in condor_submit: {output.stderr}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error trying to submit the new job {filename_sub_classad}")


async def jobs_state_service(sub_container_name: str, session_jobs: list):
    '''
    retrieve the current state of the jobs from HTCondor since the given container (submit role).
    returns a summarized JSON (using summarize_jobs) ready for the frontend.
    '''
    attributes = "Owner,JobBatchName,QDate,JobStatus,ClusterId,ProcId,Cmd"
    command = f"docker exec {sub_container_name} sh -c 'condor_q -json -attributes \"{attributes}\"'"
    try:
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            raise HTTPException(status_code=400, detail=stderr.decode())
        
        try:
            jobs_json = json.loads(stdout)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Error parsing condor_q output")
        
        final_jobs_info = summarize_jobs(jobs_json)

        for batch in final_jobs_info["batches"]:
            for sj in session_jobs:
                if sj["batch_name"] == batch["batch_name"]:
                    batch["initial_total"] = int(sj["number_jobs"])
                    break
        return final_jobs_info
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error trying to get jobs state: {str(e)}")

    
async def get_batch_lifetime(batch_name: str, sub_container_name: str) -> str:
    """
    obtaine the lifetime (since job submitted to job done)
    of a batch from HTCondor using condor_history instruction.
    return a string like '2m 35s' or '1h 12m 4s'.
    """
    command = (
        f"docker exec {sub_container_name} condor_history -json -constraint 'JobBatchName==\"{batch_name}\"' -attributes QDate,CompletionDate"
    )
    
    process = await asyncio.create_subprocess_shell(
        command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        raise RuntimeError(f"[ERR] in condor history: {stderr}")

    try:
        jobs = json.loads(stdout)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"[ERR] formatting jobs results")

    
    q_dates = [j.get("QDate") for j in jobs if j.get("QDate")]
    completion_dates = [j.get("CompletionDate") for j in jobs if j.get("CompletionDate")]

    start = min(q_dates)
    end = max(completion_dates)
    total_seconds = end - start

    if total_seconds <= 0:
        raise RuntimeError("[ERR] invalid duration (end <= start)")

    # formating to return
    duration = timedelta(seconds=total_seconds)
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)

    if hours > 0:
        formatted = f"{hours}h {minutes}m {seconds}s"
    elif minutes > 0:
        formatted = f"{minutes}m {seconds}s"
    else:
        formatted = f"{seconds}s"

    return formatted
    

async def jobs_results_service(job_name: str, number_jobs: int, output_type: str, sub_container_name: str):
    """
    this function orchestra the build of jobs results, iterates the sideger's
    working directory (sideger-jobs), and returns the results depending
    on the 'output_type' -defined by the user previusly-.
    ignores the files, only works with directories.
    output_type: 'a_directory' o 'n_directories'
    """
    working_directory = Path(os.path.expanduser("~/sideger-jobs"))
    if not working_directory.exists():
        return {"error": "Directorio de trabajo no existe"}

    job_dir = None

    for item in working_directory.iterdir():
        if item.is_dir() and item.name.startswith(f"{job_name}_resultados_"):
            job_dir = item
            break
    if not job_dir:
        return {"name": job_name, "executions": [], "error": "Job not found"}
    
    total_time = await get_batch_lifetime(job_name, sub_container_name)
    
    if output_type == "a_directory":
        executions = build_results_a_directory(job_dir)
    elif output_type == "n_directories":
        executions = build_results_n_directories(job_dir)
    else:
        raise ValueError(f"[ERR] output_type desconocido: {output_type}")

    return {"id": job_name, "batch_name": job_name, "number_jobs": number_jobs, "total_time": "N/A", "total_time": total_time, "executions": executions}

