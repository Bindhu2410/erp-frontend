import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spinner, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = "http://localhost:5104/api";

const BranchDelete: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/CsBranch/${branchId}`);
        const data = await res.json();
        setBranch(data.data || data);
      } catch (err) {
        setError("Failed to fetch branch details");
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [branchId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/CsBranch/${branchId}/company/${branch?.companyId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete branch");
      navigate(-1);
    } catch (err) {
      setError("Failed to delete branch");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <div className="text-danger">{error}</div>;
  if (!branch) return <div>No branch found.</div>;

  return (
    <Modal show onHide={() => navigate(-1)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Branch</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the branch <strong>{branch.branchName}</strong>?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={deleting}>
          <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BranchDelete;
