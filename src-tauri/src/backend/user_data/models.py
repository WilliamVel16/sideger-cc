from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    jobs = relationship("Job", back_populates="user")



class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    universe = Column(String, nullable=False)
    job_name = Column(String, nullable=False)
    execution_date = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    execution_total_time = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="jobs")
    results = relationship("Result", back_populates="job", cascade="all, delete-orphan")

    
class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    result = Column(String, nullable=False)
    execution_time = Column(Integer, nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))

    job = relationship("Job", back_populates="results")





# class Cluster(Base):
#     __tablename__ = "clusters"

#     id = Column(Integer, primary_key=True, index=True)
#     created_at = Column(TIMESTAMP(timezone=True), nullable=False)
#     time_up = Column()
#     jobs_executed = Column()
    
    