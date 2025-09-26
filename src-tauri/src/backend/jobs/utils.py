from datetime import datetime
from collections import defaultdict

def summarize_jobs(jobs):
    """
    summarize HTCondor jobs JSON into a clear structure for frontend display.
    this function expects the output from "condor_q -json" with these attributes:
    Owner, JobBatchName, QDate, JobStatus, ClusterId, ProcId, Cmd.

    args:
        jobs_json (list): a list of job dictionaries returned by condor_q -json.

    returns:
        dict: a dictionary containing timestamp, batches (list of batches with job details),
              and totals (summary counts for all jobs).
    """

    # map jobs state
    status_map = {
        1: 'Idle',
        2: 'Run',
        3: 'Removed',
        4: 'Done',
        5: 'Held',
        6: 'Transferring',
        7: 'Suspended'
    }

    # sideger is build to only one user (user in HTCondor context)
    batches_dict = {}

    for job in jobs:
        batch_name = job.get("JobBatchName", "default")
        submitted_timestamp = job.get("QDate", 0)
        jobstatus_code = job.get("JobStatus", 0)
        cluster_id = job.get("ClusterId")
        proc_id = job.get("ProcId")
        cmd = job.get("Cmd")

        job_entry = {
            "batch_name": batch_name,
            "submitted": datetime.fromtimestamp(submitted_timestamp).strftime("%m/%d %H:%M"),
            "status": status_map.get(jobstatus_code, "Unknown"),
            "cluster_id": cluster_id,
            "proc_id": proc_id,
            "cmd": cmd
        }

        if batch_name not in batches_dict:
            batches_dict[batch_name] = []
        batches_dict[batch_name].append(job_entry)

    # build final jobs data
    batches = []
    for batch_name, jobs_list in batches_dict.items():
        done_count = sum(1 for j in jobs_list if j["status"] == "Done")
        run_count = sum(1 for j in jobs_list if j["status"] == "Run")
        idle_count = sum(1 for j in jobs_list if j["status"] == "Idle")
        held_count = sum(1 for j in jobs_list if j["status"] == "Held")
        suspended_count = sum(1 for j in jobs_list if j["status"] == "Suspended")
        total_count = len(jobs_list)

        # format job_ids (cluster.proc style)
        cluster_ids = [j["cluster_id"] for j in jobs_list]
        proc_ids = [j["proc_id"] for j in jobs_list]
        if len(set(cluster_ids)) == 1:
            job_ids = f"{cluster_ids[0]}.{min(proc_ids)}-{max(proc_ids)}"
        else:
            #  list all when different clusters
            job_ids = ", ".join(f"{c}.{p}" for c, p in zip(cluster_ids, proc_ids))

        batches.append({
            "batch_name": batch_name,
            "submitted": jobs_list[0]["submitted"],
            "done": done_count,
            "run": run_count,
            "idle": idle_count,
            "held": held_count,
            "suspended": suspended_count,
            "total": total_count,
            "job_ids": job_ids,
            "jobs": jobs_list  # full jobs info
        })

    # totals across all batches
    totals = {
        "total_jobs": sum(b["total"] for b in batches),
        "done": sum(b["done"] for b in batches),
        "run": sum(b["run"] for b in batches),
        "idle": sum(b["idle"] for b in batches),
        "held": sum(b["held"] for b in batches),
        "suspended": sum(b["suspended"] for b in batches)
    }

    return {
        "timerequest": datetime.now().isoformat(), # temp to do tests
        "batches": batches,
        "totals": totals
    }