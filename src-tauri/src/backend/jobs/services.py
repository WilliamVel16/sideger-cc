import os
import asyncio
import subprocess
import json
from fastapi import HTTPException
from .submit_builder import HTCondorSubmit
from .schemas import JobData

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


async def jobs_state_service(sub_container_name: str):
    '''
    permits retrieve the state of the jobs that are in the cluster queue
    '''

    command = f"docker exec {sub_container_name} sh -c 'condor_q -json'"
    try:
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        if process.returncode == 0:
            try:
                state_jobs = json.loads(stdout)
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="Error parsing condor_q output")
            return state_jobs
        else:
            raise HTTPException(status_code=400, detail=stderr.decode())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error trying to get jobs state: {str(e)}")
