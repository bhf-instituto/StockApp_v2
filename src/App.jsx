import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import gsap from "gsap";
import Login from "./components/Login";
import Distribuidores from "./components/Distribuidores";
import Productos from "./components/Productos";
import { auth } from "./firebase/client";
import { getUserProfile, hasActiveAccess } from "./services/userProfiles";

const DEFAULT_SECTION = "distribuidores";

function App() {
  const [session, setSession] = useState(null);
  const [seccion, setSeccion] = useState(DEFAULT_SECTION);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authNotice, setAuthNotice] = useState("");
  const prevSeccion = useRef(DEFAULT_SECTION);
  const distribuidoresRef = useRef(null);
  const productosRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const user = session?.authUser ?? null;

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!isMounted) {
        return;
      }

      if (!authUser) {
        setSession(null);
        setIsCheckingAuth(false);
        return;
      }

      setIsCheckingAuth(true);

      try {
        const profile = await getUserProfile(authUser.uid);

        if (!hasActiveAccess(profile)) {
          setAuthNotice(
            "Tu cuenta existe, pero todavia no fue habilitada para usar esta version."
          );
          setSession(null);
          await signOut(auth);
          return;
        }

        if (!isMounted) {
          return;
        }

        setSession({ authUser, profile });
        setAuthNotice("");
      } catch (error) {
        console.error("No se pudo validar el acceso del usuario.", error);
        setAuthNotice(
          "No pudimos validar tu acceso en este momento. Intenta nuevamente."
        );
        setSession(null);
        await signOut(auth).catch(() => {});
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    if (user) {
      setSeccion(DEFAULT_SECTION);
    }
  }, [user]);

  useLayoutEffect(() => {
    if (!user) {
      return;
    }

    gsap.set(distribuidoresRef.current, { xPercent: 0, opacity: 1, zIndex: 2 });
    gsap.set(productosRef.current, { xPercent: 100, opacity: 0, zIndex: 1 });
  }, [user]);

  useLayoutEffect(() => {
    if (prevSeccion.current === seccion) {
      return;
    }

    const nuevaSeccion =
      seccion === "distribuidores"
        ? distribuidoresRef.current
        : productosRef.current;
    const seccionAnterior =
      prevSeccion.current === "distribuidores"
        ? distribuidoresRef.current
        : productosRef.current;
    const direction = seccion === "distribuidores" ? -200 : 100;

    gsap.set([distribuidoresRef.current, productosRef.current], {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
    });

    gsap.fromTo(
      nuevaSeccion,
      { xPercent: direction, opacity: 1, zIndex: 2, ease: "none" },
      { xPercent: 0, opacity: 1, duration: 0.5, ease: "none" }
    );

    gsap.to(seccionAnterior, {
      xPercent: direction * -1,
      opacity: 0,
      zIndex: 1,
      duration: 0.5,
      ease: "none",
    });

    prevSeccion.current = seccion;
  }, [seccion]);

  const handleTouchStart = (event) => {
    touchStartRef.current = event.changedTouches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    touchEndRef.current = event.changedTouches[0].clientX;

    if (touchStartRef.current - touchEndRef.current > 50) {
      if (seccion !== "productos") {
        setSeccion("productos");
      }
    } else if (touchEndRef.current - touchStartRef.current > 50) {
      if (seccion !== "distribuidores") {
        setSeccion("distribuidores");
      }
    }
  };

  if (isCheckingAuth) {
    return (
      <section className="page-container">
        <div className="main-container container-fluid">
          <div className="section section-login login-container">
            <form>
              <h2 className="h2-title mb-3">StockApp v2</h2>
              <p className="text-center text-secondary mb-0">
                Verificando acceso...
              </p>
            </form>
          </div>
          <div className="background"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <div
        className="main-container container-fluid"
        onTouchStart={user ? handleTouchStart : null}
        onTouchEnd={user ? handleTouchEnd : null}
      >
        {user ? (
          <>
            <div className="btn-group btn-group-nav w-100">
              <button
                type="button"
                className={`btn ${seccion === "distribuidores" ? "active" : ""}`}
                onClick={() =>
                  seccion !== "distribuidores" && setSeccion("distribuidores")
                }
              >
                Creacion
              </button>
              <button
                type="button"
                className={`btn ${seccion === "productos" ? "active" : ""}`}
                onClick={() => seccion !== "productos" && setSeccion("productos")}
              >
                Listas
              </button>
              <button
                type="button"
                className="btn btn-danger btn-danger-nav"
                onClick={handleLogout}
              >
                <i className="fa fa-user-times" aria-hidden="true"></i>
              </button>
            </div>

            <div className="seccion-contenedor">
              <div
                ref={distribuidoresRef}
                className="seccion section-distribuidores"
              >
                <Distribuidores user={user} />
              </div>
              <div ref={productosRef} className="seccion section-productos">
                <Productos user={user} />
              </div>
            </div>
          </>
        ) : (
          <Login
            statusMessage={authNotice}
            onClearStatusMessage={() => setAuthNotice("")}
          />
        )}
        <div className="background"></div>
      </div>
    </section>
  );
}

export default App;
