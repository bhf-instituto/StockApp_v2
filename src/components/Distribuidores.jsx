import { useEffect, useState } from "react";
import Modal from "./Modal";
import DistribuidorForm from "./DistributorForm";
import ProductForm from "./ProductForm";
import {
  deleteDistributor,
  subscribeToDistributors,
} from "../services/distributors";

const Distribuidores = ({ user }) => {
  const [distribuidores, setDistribuidores] = useState([]);
  const [distribuidorSeleccionado, setDistribuidorSeleccionado] = useState(null);
  const [distribuidorParaProducto, setDistribuidorParaProducto] = useState(null);
  const [mostrarModalDistribuidor, setMostrarModalDistribuidor] = useState(false);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return subscribeToDistributors(user.uid, setDistribuidores);
  }, [user?.uid]);

  const cerrarModalDistribuidor = () => {
    setMostrarModalDistribuidor(false);
    setDistribuidorSeleccionado(null);
  };

  const cerrarModalProducto = () => {
    setMostrarModalProducto(false);
    setDistribuidorParaProducto(null);
  };

  const handleEliminarDistribuidor = async (distribuidor) => {
    if (
      !window.confirm(
        "Seguro que quieres eliminar este distribuidor y todos sus productos?"
      )
    ) {
      return;
    }

    try {
      await deleteDistributor(user.uid, distribuidor.id);
    } catch (error) {
      console.error("Error al eliminar distribuidor", error);
      window.alert("No pudimos eliminar el distribuidor.");
    }
  };

  return (
    <div className="section section-distribuidores">
      <div className="btn-group dist-buttons mb-3 d-flex">
        <button
          type="button"
          className={modoEdicion ? "btn btn-edit-true" : "btn"}
          onClick={() => setModoEdicion((prev) => !prev)}
        >
          {modoEdicion ? "Salir" : "Editar"}
        </button>

        <button
          type="button"
          className="btn"
          onClick={() => {
            setDistribuidorSeleccionado(null);
            setMostrarModalDistribuidor(true);
          }}
        >
          Crear
        </button>
      </div>

      {distribuidores.length > 0 ? (
        <ul className="list-group mb-4 list-distribuidores">
          {distribuidores.map((distribuidor) => (
            <li
              key={distribuidor.id}
              className="list-group-item d-flex justify-content-between align-items-center"
              onClick={() => {
                if (modoEdicion) {
                  setDistribuidorSeleccionado(distribuidor);
                  setMostrarModalDistribuidor(true);
                }
              }}
            >
              <div className="dist-text-container">
                <div>
                  <strong>{distribuidor.nombre}</strong>
                  <span>{distribuidor.diaSemana}</span>
                </div>
                <small>
                  <i className="fa fa-phone" aria-hidden="true"></i>{" "}
                  {distribuidor.telefono || "Sin telefono"}
                </small>
              </div>

              {modoEdicion ? (
                <button
                  type="button"
                  className="rounded-1 btn-add-product btn-remove-dist"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEliminarDistribuidor(distribuidor);
                  }}
                >
                  <i className="fa fa-trash-o" aria-hidden="true"></i>
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-1 btn-add-product"
                  onClick={() => {
                    setDistribuidorParaProducto(distribuidor);
                    setMostrarModalProducto(true);
                  }}
                >
                  <i className="fa fa-plus" aria-hidden="true"></i>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay distribuidores aun.</p>
      )}

      <Modal isOpen={mostrarModalDistribuidor} onClose={cerrarModalDistribuidor}>
        <DistribuidorForm
          user={user}
          distribuidor={distribuidorSeleccionado}
          onDistribuidorAgregado={cerrarModalDistribuidor}
        />
      </Modal>

      <Modal isOpen={mostrarModalProducto} onClose={cerrarModalProducto}>
        <ProductForm
          user={user}
          distribuidorId={distribuidorParaProducto?.id}
          distribuidorNombre={distribuidorParaProducto?.nombre}
          onProductoAgregado={cerrarModalProducto}
        />
      </Modal>
    </div>
  );
};

export default Distribuidores;
