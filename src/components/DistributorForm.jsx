import { useEffect, useState } from "react";
import { saveDistributor } from "../services/distributors";
import { DAYS_OF_WEEK } from "../utils/stockValidation";

const DistribuidorForm = ({ user, distribuidor, onDistribuidorAgregado }) => {
  const [nombre, setNombre] = useState(distribuidor?.nombre || "");
  const [telefono, setTelefono] = useState(distribuidor?.telefono || "");
  const [diaSemana, setDiaSemana] = useState(
    distribuidor?.diaSemana || DAYS_OF_WEEK[0]
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (distribuidor) {
      setNombre(distribuidor.nombre);
      setTelefono(distribuidor.telefono);
      setDiaSemana(distribuidor.diaSemana);
      return;
    }

    setNombre("");
    setTelefono("");
    setDiaSemana(DAYS_OF_WEEK[0]);
  }, [distribuidor]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      await saveDistributor(
        user.uid,
        { nombre, telefono, diaSemana },
        distribuidor?.id
      );
      onDistribuidorAgregado();
    } catch (error) {
      console.error("Error al guardar distribuidor", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No pudimos guardar el distribuidor."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded">
      <h3>{distribuidor ? "Editar Distribuidor" : "Agregar Distribuidor"}</h3>

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(event) => setNombre(event.target.value)}
        className="form-control mb-2"
        required
      />

      <input
        type="tel"
        placeholder="Telefono"
        value={telefono}
        onChange={(event) => setTelefono(event.target.value)}
        className="form-control mb-2"
      />

      <select
        value={diaSemana}
        onChange={(event) => setDiaSemana(event.target.value)}
        className="form-control mb-2"
      >
        {DAYS_OF_WEEK.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>

      {errorMessage ? (
        <p className="text-danger small mb-2">{errorMessage}</p>
      ) : null}

      <button type="submit" className="btn btn-success w-100" disabled={isSaving}>
        {isSaving ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
};

export default DistribuidorForm;
