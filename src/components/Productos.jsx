import { Fragment, useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import ProductForm from "./ProductForm";
import BotonCopiarLista from "./BotonCopiarLista";
import BotonCopiar from "./BotonCopiar";
import { subscribeToDistributors } from "../services/distributors";
import {
  deleteProduct,
  subscribeToProducts,
  updateProductStock,
} from "../services/products";
import {
  buildDistributorOrderText,
  getMissingQuantity,
} from "../utils/orderMessages";

const Productos = ({ user }) => {
  const [productosPorDistribuidor, setProductosPorDistribuidor] = useState({});
  const [distribuidores, setDistribuidores] = useState([]);
  const [filaExpandida, setFilaExpandida] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [distribuidorSeleccionado, setDistribuidorSeleccionado] =
    useState(null);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [pasoRapido, setPasoRapido] = useState(1);
  const [distribuidorExpandido, setDistribuidorExpandido] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      return undefined;
    }

    return subscribeToDistributors(user.uid, (nextDistributors) => {
      setDistribuidores(nextDistributors);
      setDistribuidorExpandido((currentValue) => {
        const distributorStillExists = nextDistributors.some(
          (distributor) => distributor.id === currentValue
        );

        if (distributorStillExists) {
          return currentValue;
        }

        return nextDistributors[0]?.id ?? null;
      });
    });
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || distribuidores.length === 0) {
      setProductosPorDistribuidor({});
      return undefined;
    }

    const unsubscribeFunctions = distribuidores.map((distribuidor) =>
      subscribeToProducts(user.uid, distribuidor.id, (productos) => {
        setProductosPorDistribuidor((prevState) => ({
          ...prevState,
          [distribuidor.id]: productos,
        }));
      })
    );

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [distribuidores, user?.uid]);

  const nombresDistribuidores = useMemo(
    () =>
      distribuidores.reduce((accumulator, distribuidor) => {
        accumulator[distribuidor.id] = {
          nombre: distribuidor.nombre,
          telefono: distribuidor.telefono,
        };
        return accumulator;
      }, {}),
    [distribuidores]
  );

  const toggleDistribuidor = (distribuidorId) => {
    setDistribuidorExpandido((prev) =>
      prev === distribuidorId ? null : distribuidorId
    );
  };

  const actualizarCantidadProducto = async (
    distribuidorId,
    productoId,
    cantidad
  ) => {
    try {
      await updateProductStock(user.uid, distribuidorId, productoId, cantidad);
    } catch (error) {
      console.error("Error al actualizar cantidad", error);
      window.alert("No pudimos actualizar el stock.");
    }
  };

  const handleEliminarProducto = async (distribuidorId, productoId) => {
    if (!window.confirm("Seguro que quieres eliminar este producto?")) {
      return;
    }

    try {
      await deleteProduct(user.uid, distribuidorId, productoId);
    } catch (error) {
      console.error("Error al eliminar producto", error);
      window.alert("No pudimos eliminar el producto.");
    }
  };

  const enviarMensajeWhatsApp = (distribuidorId) => {
    const distribuidor = nombresDistribuidores[distribuidorId];

    if (!distribuidor) {
      return;
    }

    const productosFaltantes = buildDistributorOrderText(
      distribuidor,
      productosPorDistribuidor[distribuidorId]
    );

    if (!productosFaltantes) {
      window.alert("No hay productos faltantes para este distribuidor.");
      return;
    }

    const telefonoFormateado = distribuidor.telefono
      ? distribuidor.telefono.replace(/\D/g, "")
      : "";

    const url = telefonoFormateado
      ? `https://wa.me/${telefonoFormateado}?text=${encodeURIComponent(
          productosFaltantes
        )}`
      : `https://wa.me/?text=${encodeURIComponent(productosFaltantes)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="section section-productos">
      <div className="btn-group dist-buttons d-flex mb-3">
        <button
          type="button"
          className={modoEdicion ? "btn btn-edit-true" : "btn"}
          onClick={() => setModoEdicion((prev) => !prev)}
        >
          {modoEdicion ? "Salir" : "Editar"}
        </button>
        <BotonCopiarLista
          productosPorDistribuidor={productosPorDistribuidor}
          nombresDistribuidores={nombresDistribuidores}
        />
      </div>

      {distribuidores.length > 0 ? (
        distribuidores.map((distribuidor) => {
          const distribuidorId = distribuidor.id;
          const productos = productosPorDistribuidor[distribuidorId] ?? [];

          return (
            <div key={distribuidorId} className="mb-4">
              <table className="table-products">
                <thead>
                  <tr className="table-products-header-top">
                    <th
                      colSpan={modoEdicion ? 4 : 3}
                      className="text-center list-distr-name"
                    >
                      <div className="products-header">
                        <h3
                          className="toggle-header"
                          onClick={() => toggleDistribuidor(distribuidorId)}
                        >
                          {distribuidor.nombre}
                        </h3>
                        <div className="btn-group btns-distr">
                          <button
                            type="button"
                            className="btn btn-sm ms-2 btn-wpp"
                            onClick={() => enviarMensajeWhatsApp(distribuidorId)}
                          >
                            <i className="fa fa-whatsapp" aria-hidden="true"></i>
                          </button>
                          <BotonCopiar
                            distribuidorId={distribuidorId}
                            productosPorDistribuidor={productosPorDistribuidor}
                            nombresDistribuidores={nombresDistribuidores}
                          />
                        </div>
                      </div>
                    </th>
                  </tr>

                  {distribuidorExpandido === distribuidorId && productos.length > 0 ? (
                    <tr className="table-products-header">
                      <th>Producto</th>
                      <th>Actual</th>
                      <th>Deseada</th>
                      {modoEdicion ? <th>Acciones</th> : null}
                    </tr>
                  ) : null}
                </thead>

                <tbody
                  className={
                    distribuidorExpandido === distribuidorId
                      ? "header-table-expanded"
                      : "header-table-collapsed"
                  }
                >
                  {distribuidorExpandido === distribuidorId
                    ? productos.map((producto) => {
                        const faltante = getMissingQuantity(producto) > 0;
                        const filaId = `${distribuidorId}:${producto.id}`;

                        return (
                          <Fragment key={producto.id}>
                            <tr
                              className={`producto ${
                                filaExpandida === filaId ? "selected" : ""
                              }`}
                            >
                              <td
                                onClick={() => {
                                  if (modoEdicion) {
                                    setProductoSeleccionado(producto);
                                    setDistribuidorSeleccionado(distribuidorId);
                                    setMostrarModalProducto(true);
                                  }
                                }}
                              >
                                {producto.nombre}
                              </td>
                              <td
                                className={
                                  faltante
                                    ? "cant-actual-faltante"
                                    : "cant-actual"
                                }
                                onClick={() => {
                                  if (modoEdicion) {
                                    setProductoSeleccionado(producto);
                                    setDistribuidorSeleccionado(distribuidorId);
                                    setMostrarModalProducto(true);
                                  } else {
                                    setFilaExpandida((currentValue) =>
                                      currentValue === filaId ? null : filaId
                                    );
                                  }
                                }}
                              >
                                {producto.cantActual}
                              </td>
                              <td className="cant-deseada">
                                {producto.cantDeseada}
                              </td>
                              {modoEdicion ? (
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-delete-product"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleEliminarProducto(
                                        distribuidorId,
                                        producto.id
                                      );
                                    }}
                                  >
                                    <i
                                      className="fa fa-times-circle-o"
                                      aria-hidden="true"
                                    ></i>
                                  </button>
                                </td>
                              ) : null}
                            </tr>

                            {filaExpandida === filaId && !modoEdicion ? (
                              <tr className="fila-expandida">
                                <td colSpan="3" className="text-center">
                                  <div className="btn-group w-100">
                                    <button
                                      type="button"
                                      className="btn"
                                      onClick={() =>
                                        actualizarCantidadProducto(
                                          distribuidorId,
                                          producto.id,
                                          producto.cantActual - pasoRapido
                                        )
                                      }
                                    >
                                      -{pasoRapido}
                                    </button>
                                    <button
                                      type="button"
                                      className={
                                        pasoRapido === 5
                                          ? "btn btn-multiplicar-on"
                                          : "btn btn-multiplicar"
                                      }
                                      onClick={() =>
                                        setPasoRapido((prev) =>
                                          prev === 1 ? 5 : 1
                                        )
                                      }
                                    >
                                      {pasoRapido === 5 ? "x5" : "x1"}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn"
                                      onClick={() =>
                                        actualizarCantidadProducto(
                                          distribuidorId,
                                          producto.id,
                                          producto.cantActual + pasoRapido
                                        )
                                      }
                                    >
                                      +{pasoRapido}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })
                    : null}
                </tbody>
              </table>
            </div>
          );
        })
      ) : (
        <p>No hay distribuidores disponibles.</p>
      )}

      <Modal
        isOpen={mostrarModalProducto}
        onClose={() => {
          setMostrarModalProducto(false);
          setProductoSeleccionado(null);
          setDistribuidorSeleccionado(null);
        }}
      >
        <ProductForm
          user={user}
          distribuidorId={distribuidorSeleccionado}
          distribuidorNombre={
            nombresDistribuidores[distribuidorSeleccionado]?.nombre
          }
          producto={productoSeleccionado}
          onProductoAgregado={() => {
            setMostrarModalProducto(false);
            setProductoSeleccionado(null);
            setDistribuidorSeleccionado(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Productos;
