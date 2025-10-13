class HTCondorSubmit:
    def __init__(self, **kwargs):
        self.fields = kwargs

    def to_submit_file(self) -> str:
        lines = []
        for key, value in self.fields.items():
            if value is None or value == "":
                continue
            if isinstance(value, list):
                value = ",".join(value)
            if key == "queue":
                continue
            lines.append(f"{key} = {value}")
        queue_value = self.fields.get("queue", 1)
        lines.append(f"queue {queue_value}")
        return "\n".join(lines)

    def save(self, filename: str):
        with open(filename, "w") as f:
            f.write(self.to_submit_file())
