import { SITE_URL, PUBLIC_ROUTES } from "@/constants/site";

export default function sitemap() {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));
}
