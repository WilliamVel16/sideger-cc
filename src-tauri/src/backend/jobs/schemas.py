from typing import Optional, List
from pydantic import BaseModel

class JobData(BaseModel):
    executable: str
    log: Optional[str] = None
    output: Optional[str] = None
    error: Optional[str] = None
    queue: Optional[int] 
    arguments: Optional[str] = None
    input: Optional[str] = None
    should_transfer_files: Optional[str] = None
    transfer_input_files: Optional[str] = None
    when_to_transfer_output: Optional[str] = None
    request_cpus: Optional[str] = None
    request_memory: Optional[str] = None
    request_disk: Optional[str] = None
    request_gpus: Optional[int] = None
    shell: Optional[str] = None
    batch_name: Optional[str] = None
    transfer_output_files: Optional[List[str]] = None
    max_retries: Optional[int] = None
    periodic_remove: Optional[str] = None
    universe: Optional[str] = None