from pydantic import BaseModel
from typing import Optional

class ContainerConfig(BaseModel):
    ip: str
    role: str
    image: Optional[str] = None
    container_name: Optional[str] = None
    onetwork_name: str
    hostname: str
    user: str

    @classmethod
    def new(cls, ip: str, role: str, onetwork_name: str, hostname: str, user: str) -> 'ContainerConfig':
        """
        creates a container config with its respective image.
        based in the role defined by the user.
        """
        role_to_image = {
            "cm": "wvel/sideger-cm:1.0.2",
            "sub": "wvel/sideger-sub:4.1.7",
            "exe": "wvel/sideger-exe:1.0.2"
        }

        if role not in role_to_image:
            raise ValueError(f"Unknown role: {role}")

        image = role_to_image[role]
        cont_name = f"{role}_{ip.replace('.', '_')}"

        return cls(
            ip=ip,
            role=role,
            image=image,
            container_name=cont_name,
            onetwork_name=onetwork_name,
            hostname=hostname,
            user=user
        )
