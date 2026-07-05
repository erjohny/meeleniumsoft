import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DialogProvider } from "./dialogs/dialogs.jsx";
import MainApp from "./MainApp.jsx";
import View from "./view/View.jsx";
import Example from "./view/Example.jsx";
import { DEFAULT_DATA, REG_EXAMPLE_DATA } from "./engine/defaultData.js";

export default function App() {
  return (
    <BrowserRouter>
      <DialogProvider>
        <Routes>
          <Route path="/view" element={<View />} />
          <Route path="/s/:slug" element={<View />} />
          <Route path="/example" element={<Example data={DEFAULT_DATA} />} />
          <Route path="/example-reg" element={<Example data={REG_EXAMPLE_DATA} />} />
          <Route path="*" element={<MainApp />} />
        </Routes>
      </DialogProvider>
    </BrowserRouter>
  );
}
