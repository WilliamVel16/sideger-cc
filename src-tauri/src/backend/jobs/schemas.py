from typing import Optional, List
from pydantic import BaseModel

class JobData(BaseModel):
    universe: Optional[str] = None
    batch_name: Optional[str] = None
    executable: str
    shell: Optional[str] = None
    input: Optional[str] = None
    arguments: Optional[str] = None
    transfer_input_files: Optional[str] = None
    should_transfer_files: Optional[str] = None
    transfer_output_files: Optional[List[str]] = None
    when_to_transfer_output: Optional[str] = None
    request_cpus: Optional[str] = None
    request_memory: Optional[str] = None
    request_disk: Optional[str] = None
    request_gpus: Optional[int] = None
    log: Optional[str] = None
    output: Optional[str] = None
    error: Optional[str] = None
    max_retries: Optional[int] = None
    periodic_remove: Optional[str] = None
    queue: Optional[int] 


class JobSubmitRequest(BaseModel):
    job_data: JobData
    submit_role_container_name: str
    output_type: str


class JobResultsRequest(BaseModel):
    batch_name: str
    number_jobs: int
    output_type: str