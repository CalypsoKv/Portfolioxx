import { Navigate, Route, Routes, useParams } from "react-router-dom";
import About from "./routes/About";
import Catalogue from "./routes/Catalogue";
import Home from "./routes/Home";
import Services from "./routes/Services";
import Work from "./routes/Work";
import World from "./routes/World";
import TvShell from "./shell/TvShell";

function TreatmentRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/work/${slug}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<TvShell />}>
        <Route index element={<Home />} />
        <Route path="catalogue" element={<Catalogue />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<About />} />
        <Route path="work/:slug" element={<Work />} />
        <Route path="work/:slug/treatment" element={<TreatmentRedirect />} />
        <Route path="design-system" element={<World />} />
        <Route path="*" element={<Work />} />
      </Route>
    </Routes>
  );
}
