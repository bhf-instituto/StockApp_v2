import { useState } from "react";
import { buildGlobalOrderText } from "../utils/orderMessages";

const BotonCopiarLista = ({ productosPorDistribuidor, nombresDistribuidores }) => {
  const [botonTexto, setBotonTexto] = useState("Copiar Lista");

  const handleClick = async () => {
    const mensaje = buildGlobalOrderText(
      productosPorDistribuidor,
      nombresDistribuidores
    );

    if (!mensaje) {
      window.alert("No hay productos faltantes.");
      return;
    }

    try {
      await navigator.clipboard.writeText(mensaje);
      setBotonTexto("Copiado");
      window.setTimeout(() => {
        setBotonTexto("Copiar Lista");
      }, 1000);
    } catch (error) {
      console.error("Error al copiar la lista completa.", error);
      window.alert("No pudimos copiar la lista.");
      setBotonTexto("Copiar Lista");
    }
  };

  return (
    <button type="button" className="btn" onClick={handleClick}>
      {botonTexto}
    </button>
  );
};

export default BotonCopiarLista;
