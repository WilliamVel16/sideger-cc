import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Styles.css";

function Sidebar() {


  return (
    <div className="sidebar">
      {/* header */}
      <div className="sidebar-header">
        <img src={logo} alt="Sideger Logo" className="logo" />
        <span className="tool-name"> Sideger </span>
      </div>

      {/* sections */}
      <nav className="nav-sections">
        <div className="section">
          <div className="section-title"> Home </div>
          <NavLink to="/" className="nav-link">Home</NavLink>
        </div>

        <div className="section">
          <div className="section-title"> Cluster </div>
          <NavLink to="/resources" className="nav-link"> Recursos </NavLink>
          <NavLink to="/initialize-cluster" className="nav-link"> Desplegar </NavLink>
        </div>

        <div className="section">
          <div className="section-title">Trabajos</div>
          <NavLink to="/jobs/new" className="nav-link"> Nuevo Trabajo </NavLink>
          <NavLink to="/jobs/queue" className="nav-link"> Estado de Trabajos </NavLink>
          <NavLink to="/jobs/finished" className="nav-link"> Finalizados </NavLink>
        </div>
        
        <div className="section">
          <div className="section-title">Registros</div>
          <NavLink to="/registers/jobs" className="nav-link"> Trabajos Anteriores </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;

