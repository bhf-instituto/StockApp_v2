import { useState } from "react";
import { buildDistributorOrderText } from "../utils/orderMessages";

const BotonCopiar = ({
  distribuidorId,
  productosPorDistribuidor,
  nombresDistribuidores,
}) => {
  const [textoBoton, setTextoBoton] = useState("Copiar");

  const copiarPedidoPorDistribuidor = async () => {
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

    try {
      await navigator.clipboard.writeText(productosFaltantes);
      setTextoBoton("Copiado");
      window.setTimeout(() => setTextoBoton("Copiar"), 1000);
    } catch (error) {
      console.error("Error al copiar el pedido.", error);
      window.alert("Error al copiar el pedido.");
    }
  };

  return (
    <button
      type="button"
      className="btn copy-distri"
      onClick={copiarPedidoPorDistribuidor}
    >
      {textoBoton}
    </button>
  );
};

export default BotonCopiar;
