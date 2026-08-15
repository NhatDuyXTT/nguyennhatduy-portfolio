import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import TikTokDownloader from "./pages/TikTokDownloader";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/tiktok-downloader" element={<TikTokDownloader />} />
      </Routes>
    </Layout>
  );
}
