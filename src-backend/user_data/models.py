from email.policy import default

from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
from datetime import datetime
import pytz

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    jobs = relationship("Job", back_populates="user")
    clusters = relationship("Cluster", back_populates="user", cascade="all, delete-orphan")


class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    number_nodes = Column(Integer, nullable=True)
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(pytz.timezone('America/Bogota')), nullable=False)
    shutdown_at = Column(TIMESTAMP, default=None, onupdate=lambda: datetime.now(pytz.timezone('America/Bogota')))
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="clusters")
    jobs = relationship("Job", back_populates="cluster", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    universe = Column(String, nullable=False)
    job_name = Column(String, nullable=False)
    execution_date = Column(String, nullable=False)
    execution_total_time = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    cluster_id = Column(Integer, ForeignKey("clusters.id"))

    user = relationship("User", back_populates="jobs")
    cluster = relationship("Cluster", back_populates="jobs")
    results = relationship("Result", back_populates="job", cascade="all, delete-orphan")

    
class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    result = Column(String, nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"))

    job = relationship("Job", back_populates="results")