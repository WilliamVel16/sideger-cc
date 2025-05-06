import { useState } from "react";

function Topbar() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="topbar">
      <div>🔔 Notificaciones</div>
      <div className="user-menu">
        <span onClick={() => setShowMenu(!showMenu)}>⚙️ Opciones</span>
        {showMenu && (
          <ul className="dropdown">
            <li>Reiniciar</li>
            <li>Dar de Baja</li>
            <li>Salir</li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default Topbar;
