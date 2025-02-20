import React from "react";

import { useNavigate } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import "./NotFound.scss";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="hero-section" role="banner">
        <div className="content-wrapper">
          <div className="hero-content">
            <h1>
              404
              <span>Page Not Found</span>
            </h1>
            <p className="subtitle">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeft size={20} />}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
