from typing import Optional, List

class HTCondorSubmit:
    def __init__(
        self,
        executable: str,
        log: str,
        output: str,
        error: str,
        queue: str = "1",
        arguments: Optional[str] = None,
        input_file: Optional[str] = None,
        should_transfer_files: Optional[str] = None,
        transfer_input_files: Optional[List[str]] = None,
        initialdir: Optional[str] = None,
        when_to_transfer_output: Optional[str] = None,
        request_cpus: Optional[int] = None,
        request_memory: Optional[str] = None,
        request_disk: Optional[str] = None,
        max_retries: Optional[int] = None,
        universe: Optional[str] = None,
    ):
        self.executable = executable
        self.arguments = arguments
        self.input_file = input_file
        self.should_transfer_files = should_transfer_files
        self.transfer_input_files = transfer_input_files
        self.initialdir = initialdir
        self.when_to_transfer_output = when_to_transfer_output
        self.request_cpus = request_cpus
        self.request_memory = request_memory
        self.request_disk = request_disk
        self.log = log
        self.output = output
        self.error = error
        self.max_retries = max_retries
        self.universe = universe
        self.queue = queue

    def to_submit_file(self) -> str:
        """Generates the .sub file of HTCondor (ClassAd)"""
        lines = []

        if self.universe:
            lines.append(f"universe = {self.universe}")
        lines.append(f"executable = {self.executable}")

        if self.arguments:
            lines.append(f"arguments = {self.arguments}")
        if self.input_file:
            lines.append(f"input = {self.input_file}")
        if self.should_transfer_files:
            lines.append(f"should_transfer_files = {self.should_transfer_files}")
        if self.transfer_input_files:
            files = ",".join(self.transfer_input_files)
            lines.append(f"transfer_input_files = {files}")
        if self.initialdir:
            lines.append(f"initialdir = {self.initialdir}")
        if self.when_to_transfer_output:
            lines.append(f"when_to_transfer_output = {self.when_to_transfer_output}")
        if self.request_cpus:
            lines.append(f"request_cpus = {self.request_cpus}")
        if self.request_memory:
            lines.append(f"request_memory = {self.request_memory}")
        if self.request_disk:
            lines.append(f"request_disk = {self.request_disk}")

        lines.append(f"log = {self.log}")
        lines.append(f"output = {self.output}")
        lines.append(f"error = {self.error}")

        if self.max_retries is not None:
            lines.append(f"max_retries = {self.max_retries}")

        lines.append(f"queue {self.queue}")

        return "\n".join(lines)

    def save(self, filename: str):
        """Guarda el archivo .sub"""
        with open(filename, "w") as f:
            f.write(self.to_submit_file())
