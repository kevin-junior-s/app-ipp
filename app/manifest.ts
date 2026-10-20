import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LangitTubuh · Ramalan Cuaca Tubuh",
    short_name: "LangitTubuh",
    description: "Pantau kesehatanmu lewat ramalan cuaca tubuh.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f2f2f7",
    theme_color: "#007aff",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
