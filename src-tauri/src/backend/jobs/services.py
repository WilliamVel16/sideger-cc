import os
import subprocess
from fastapi import HTTPException
from .submit_builder import HTCondorSubmit
from .schemas import JobData

def create_submit_file_service(job: JobData):
    """
    permits to create the submit file (or classad) to save it in the
    sideger-jobs directory (shared volume)
    """
    fields_filled_submit_file = HTCondorSubmit(**job.model_dump())
    #classad_file = fields_filled_submit_file.to_submit_file()

    working_directory = os.path.expanduser("~/sideger-jobs")
    os.makedirs(working_directory, exist_ok=True)

    user_set_name = "my-first-job" # temp
    filename = f"{user_set_name}.sub"
    full_path = os.path.join(working_directory, filename)
    fields_filled_submit_file.save(full_path)

    return filename


def submit_job_service(filename_sub_classad: str, sub_container_name: str):
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
            return f"[OK] in condor_submit: {output.stdout}"
        else:
            raise RuntimeError(f"[ERR] in condor_submit: {output.stderr}")
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error trying to submit the new job {filename_sub_classad}")
