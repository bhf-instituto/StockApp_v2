import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import Modal from "./Modal";
import { auth } from "../firebase/client";
import { getAuthErrorMessage } from "../utils/authErrors";

const Login = ({ statusMessage, onClearStatusMessage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (statusMessage) {
      setErrorMessage(statusMessage);
      setIsModalOpen(true);
    }
  }, [statusMessage]);

  const closeModal = () => {
    setIsModalOpen(false);
    onClearStatusMessage?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section section-login login-container">
      <form onSubmit={handleSubmit}>
        <h2 className="h2-title mb-4">StockApp</h2>
        <div className="input-group mb-2">
          <span className="input-group-text">
            <span className="fas fa-user"></span>
          </span>
          <input
            className="form-control"
            type="email"
            placeholder="Correo electronico"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="input-group mb-4">
          <span className="input-group-text">
            <span className="fas fa-key"></span>
          </span>
          <input
            className="form-control"
            type="password"
            placeholder="Contrasena"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Iniciar sesion"}
        </button>
      </form>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <p>{errorMessage}</p>
      </Modal>
    </div>
  );
};

export default Login;
