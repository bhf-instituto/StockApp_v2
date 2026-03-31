import { useEffect, useState } from "react";
import { saveProduct } from "../services/products";

const ProductForm = ({
  user,
  distribuidorId,
  distribuidorNombre,
  producto,
  onProductoAgregado,
}) => {
  const [nombre, setNombre] = useState(producto?.nombre || "");
  const [cantActual, setCantActual] = useState(producto?.cantActual || 0);
  const [cantDeseada, setCantDeseada] = useState(producto?.cantDeseada || 0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre);
      setCantActual(producto.cantActual);
      setCantDeseada(producto.cantDeseada);
      return;
    }

    setNombre("");
    setCantActual(0);
    setCantDeseada(0);
  }, [producto]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      await saveProduct(
        user.uid,
        distribuidorId,
        {
          nombre,
          cantActual,
          cantDeseada,
        },
        producto?.id
      );
      onProductoAgregado();
    } catch (error) {
      console.error("Error al guardar producto", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No pudimos guardar el producto."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded">
      <h3>{producto ? "Editar Producto" : "Agregar Producto"}</h3>

      {distribuidorNombre ? (
        <p className="text-secondary small mb-3">
          Distribuidor: {distribuidorNombre}
        </p>
      ) : null}

      <input
        type="text"
        placeholder="Nombre del producto"
        value={nombre}
        onChange={(event) => setNombre(event.target.value)}
        className="form-control mb-2"
        required
      />

      <input
        type="number"
        min="0"
        step="1"
        placeholder="Cantidad Actual"
        value={cantActual}
        onChange={(event) => setCantActual(Number(event.target.value))}
        className="form-control mb-2"
      />

      <input
        type="number"
        min="0"
        step="1"
        placeholder="Cantidad Deseada"
        value={cantDeseada}
        onChange={(event) => setCantDeseada(Number(event.target.value))}
        className="form-control mb-2"
      />

      {errorMessage ? (
        <p className="text-danger small mb-2">{errorMessage}</p>
      ) : null}

      <button type="submit" className="btn btn-success w-100" disabled={isSaving}>
        {isSaving
          ? "Guardando..."
          : producto
            ? "Guardar Cambios"
            : "Agregar Producto"}
      </button>
    </form>
  );
};

export default ProductForm;
