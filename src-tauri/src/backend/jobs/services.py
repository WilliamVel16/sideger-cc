import os
import subprocess
from fastapi import HTTPException
from .submit_builder import HTCondorSubmit
from .schemas import JobData

def create_submit_file_service(job: JobData, output_type: str):
    """
    permits to create the submit file (or classad) to save it in the
    sideger-jobs directory (shared volume).
    identifies the job and output type to create his respective classAd.
    """
    fields_filled_submit_file = HTCondorSubmit(**job.model_dump())
    #classad_file = fields_filled_submit_file.to_submit_file()

    # use cluster and process
    if output_type == "one_directory": # includes outputs with 1...n files (resultados/)
        # ep 1: queue 01 -> resultados/output_$(process).out
        # ep 2: queue 50 -> resultados/output_$(process).out
        pass
    # use cluster and process
    elif output_type == "n_directories": # includes outputts with 2...n directories / job files ; job files can use the same name
        # ep 1: queue 02 -> resultados_$(process)/output.out resumen.txt
        # ep 2: queue 50 -> resultados_$(process)/output.out resumen.txt
        pass


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
