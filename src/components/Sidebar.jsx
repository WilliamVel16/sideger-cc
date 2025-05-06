import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>sideger</h2>
      <nav>
        <NavLink to="/">Home</NavLink><br />
        <NavLink to="/resources">Recursos</NavLink><br />
        <div>
          <span>Trabajos</span>
          <ul>
            <li><NavLink to="/jobs/finished">Finalizados</NavLink></li>
            <li><NavLink to="/jobs/queue">Lista de Trabajos</NavLink></li>
            <li><NavLink to="/jobs/new">Nuevo Trabajo</NavLink></li>
          </ul>
        </div>
        <NavLink to="/test">Comando</NavLink><br />
        <NavLink to="/test2">Scripts</NavLink><br />
      </nav>
    </div>
  );
}

export default Sidebar;
