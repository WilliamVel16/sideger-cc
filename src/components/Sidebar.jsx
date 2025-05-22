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

      {/* body or sections */}
      <nav className="nav-sections">
        <div className="section">
          <div className="section-title"> Home </div>
          <NavLink to="/" className="nav-link">Home</NavLink>
        </div>

        <div className="section">
          <div className="section-title"> Recursos </div>
          <NavLink to="/resources" className="nav-link"> Recursos </NavLink>
        </div>

        <div className="section">
          <div className="section-title">Trabajos</div>
          <NavLink to="/jobs/new" className="nav-link"> Nuevo Trabajo </NavLink>
          <NavLink to="/jobs/queue" className="nav-link"> Estado de Trabajos </NavLink>
          <NavLink to="/jobs/finished" className="nav-link"> Finalizados </NavLink>
        </div>

        <div className="section">
          <div className="section-title">Temporales</div>
          <NavLink to="/start" className="nav-link">Iniciar Cluster</NavLink>
          <NavLink to="/command" className="nav-link">Comando</NavLink>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
