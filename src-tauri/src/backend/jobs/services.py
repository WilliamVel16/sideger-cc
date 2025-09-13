import os
from .submit_builder import HTCondorSubmit
from .schemas import JobData

def submit_job_service(job: JobData):
    fields_filled_submit_file = HTCondorSubmit(**job.model_dump())
    classad_file = fields_filled_submit_file.to_submit_file()

    working_directory = os.path.expanduser("~/sideger-jobs")
    os.makedirs(working_directory, exist_ok=True)

    user_set_name = "my-first-job" # temp
    filename = f"{user_set_name}.sub"
    full_path = os.path.join(working_directory, filename)
    fields_filled_submit_file.save(full_path)

    return {"classAd": classad_file, "file": filename}
