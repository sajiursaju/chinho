import { pool } from "@/lib/db";

export type HomepageSlide = {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  href: string;
  image: string;
  active: boolean;
};

const SETTINGS_ID = 1;

async function ensureHomepageSlidesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS homepage_slide_settings (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      slides_json LONGTEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

export async function getHomepageSlides(
  includeInactive = false
): Promise<HomepageSlide[]> {
  await ensureHomepageSlidesTable();

  const [rows]: any = await pool.query(
    "SELECT slides_json FROM homepage_slide_settings WHERE id = ? LIMIT 1",
    [SETTINGS_ID]
  );

  if (!rows?.[0]?.slides_json) return [];

  try {
    const slides = JSON.parse(String(rows[0].slides_json)) as HomepageSlide[];
    if (!Array.isArray(slides)) return [];

    return slides.filter(
      (slide) =>
        slide &&
        typeof slide.id === "string" &&
        (includeInactive || slide.active === true)
    );
  } catch {
    return [];
  }
}

export async function saveHomepageSlides(slides: HomepageSlide[]) {
  await ensureHomepageSlidesTable();

  await pool.query(
    `INSERT INTO homepage_slide_settings (id, slides_json)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE slides_json = VALUES(slides_json)`,
    [SETTINGS_ID, JSON.stringify(slides)]
  );

  return slides;
}