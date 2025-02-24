import { ReactElement } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { User, Users } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import "./FileManagerSidebar.scss";

export function FileManagerSidebar(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation().pathname;

  return (
    <div className="file-manager-sidebar">
      <div className="file-manager-sidebar__nav">
        <Button
          variant={location === "/files/personal" ? "primary" : "secondary"}
          leftIcon={<User size={16} />}
          onClick={() => navigate("/files/personal")}
          fullWidth
        >
          Personal
        </Button>
        <Button
          variant={location === "/files/shared" ? "primary" : "secondary"}
          leftIcon={<Users size={16} />}
          onClick={() => navigate("/files/shared")}
          fullWidth
        >
          Shared
        </Button>
      </div>
      <div className="file-manager-sidebar__sections"></div>

      <div className="file-manager-sidebar__storage">
        <div className="storage-info">
          <div className="storage-info__text">
            <span className="storage-info__used">75.5 GB</span>
            <span className="storage-info__total">of 100 GB</span>
          </div>
          <div className="storage-info__bar">
            <div
              className="storage-info__progress"
              style={{ width: "75.5%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
