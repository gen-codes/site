import { AppContextProvider } from "AppContext";
import React from "react";
import ReactDOM from "react-dom";
import "./external/react-splitpane.css";
import "./external/react-treeview.css";
import { App } from "./App";

ReactDOM.render(
    <AppContextProvider>
        <App />
    </AppContextProvider>,
    document.getElementById("root") as HTMLElement,
);
