import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/bodoni-moda/latin-900.css";
import "@fontsource/silkscreen/latin-400.css";
import "@fontsource/im-fell-dw-pica/latin-400.css";
import "@fontsource/im-fell-dw-pica/latin-400-italic.css";
import "@fontsource/vt323/latin-400.css";
import App from "./App";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/shell.css";
import "./styles/home.css";
import "./styles/pages.css";
import "./styles/showcase.css";
import "./styles/dialogs.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
