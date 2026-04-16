CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" VARCHAR(50),
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "trek_packages" (
  "id" SERIAL PRIMARY KEY,
  "package_id" integer,
  "name" VARCHAR(255) NOT NULL,
  "overview" TEXT,
  "price_gbp" DECIMAL(10,2),
  "price_usd" DECIMAL(10,2),
  "duration_days" INT,
  "difficulty" VARCHAR(50),
  "group_size_min" INT,
  "group_size_max" INT,
  "max_altitude_meters" INT,
  "itinerary_pdf_url" TEXT,
  "booking_link" TEXT,
  "trek_gallery_id" INT,
  "trek_map_embed_url" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "trek_highlights" (
  "id" SERIAL PRIMARY KEY,
  "trek_id" INT,
  "highlight" TEXT
);

CREATE TABLE "cost_includes" (
  "id" SERIAL PRIMARY KEY,
  "trek_id" INT,
  "item" TEXT
);

CREATE TABLE "cost_excludes" (
  "id" SERIAL PRIMARY KEY,
  "trek_id" INT,
  "item" TEXT
);

CREATE TABLE "itinerary_days" (
  "id" SERIAL PRIMARY KEY,
  "trek_id" INT,
  "day_number" INT,
  "description" TEXT
);

CREATE TABLE "trek_additional_info" (
  "id" SERIAL PRIMARY KEY,
  "trek_id" INT,
  "section_title" VARCHAR(255),
  "content_html" TEXT
);

CREATE TABLE "trek_share_options" (
  "id" SERIAL PRIMARY KEY,
  "trek_id" INT,
  "platform" VARCHAR(100),
  "share_url_template" TEXT
);

CREATE TABLE "site_contents" (
  "id" SERIAL PRIMARY KEY,
  "content_key" VARCHAR(100) UNIQUE,
  "title" VARCHAR(255),
  "content_html" TEXT
);

CREATE TABLE "testimonials" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255),
  "content" TEXT,
  "photo_url" TEXT,
  "rating" INT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "ratings" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT,
  "trek_id" INT,
  "rating" INT,
  "comment" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "social_links" (
  "id" SERIAL PRIMARY KEY,
  "platform" VARCHAR(100),
  "url" TEXT,
  "is_active" BOOLEAN DEFAULT true
);

CREATE TABLE "contact_messages" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255),
  "email" VARCHAR(255),
  "subject" VARCHAR(255),
  "message" TEXT,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "faqs" (
  "id" SERIAL PRIMARY KEY,
  "is_active" BOOLEAN DEFAULT true,
  "question" TEXT,
  "answer" TEXT
);

CREATE TABLE "galleries" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255),
  "image_url" TEXT,
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "company_info" (
  "id" SERIAL PRIMARY KEY,
  "is_active" BOOLEAN DEFAULT true,
  "info_key" VARCHAR(100) UNIQUE,
  "value" TEXT
);

CREATE TABLE "admin_logs" (
  "id" SERIAL PRIMARY KEY,
  "action" TEXT,
  "table_name" VARCHAR(255),
  "record_id" INT,
  "timestamp" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "seo_metadata" (
  "id" SERIAL PRIMARY KEY,
  "page_slug" VARCHAR(255) UNIQUE,
  "meta_title" TEXT,
  "meta_description" TEXT,
  "meta_keywords" TEXT
);

CREATE TABLE "subscribers" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE,
  "subscribed_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "blog_categories" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) UNIQUE
);

CREATE TABLE "blog_posts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "category_id" INT,
  "content_html" TEXT,
  "cover_image_url" TEXT,
  "published" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "custom_trip_requests" (
  "id" SERIAL PRIMARY KEY,
  "full_name" VARCHAR(255),
  "email" VARCHAR(255),
  "phone" VARCHAR(50),
  "trek_interest" TEXT,
  "custom_requirements" TEXT,
  "preferred_date_range" TEXT,
  "group_size" INT,
  "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "guides" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255),
  "photo_url" TEXT,
  "bio" TEXT,
  "languages_spoken" TEXT,
  "experience_years" INT,
  "is_active" BOOLEAN DEFAULT true
);

ALTER TABLE "trek_highlights" ADD FOREIGN KEY ("trek_id") REFERENCES "trek_packages" ("id") ON DELETE CASCADE;

ALTER TABLE "cost_includes" ADD FOREIGN KEY ("trek_id") REFERENCES "trek_packages" ("id") ON DELETE CASCADE;

ALTER TABLE "cost_excludes" ADD FOREIGN KEY ("trek_id") REFERENCES "trek_packages" ("id") ON DELETE CASCADE;

ALTER TABLE "itinerary_days" ADD FOREIGN KEY ("trek_id") REFERENCES "trek_packages" ("id") ON DELETE CASCADE;

ALTER TABLE "trek_additional_info" ADD FOREIGN KEY ("trek_id") REFERENCES "trek_packages" ("id") ON DELETE CASCADE;

ALTER TABLE "trek_share_options" ADD FOREIGN KEY ("trek_id") REFERENCES "trek_packages" ("id") ON DELETE CASCADE;

ALTER TABLE "ratings" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL;

ALTER TABLE "ratings" ADD FOREIGN KEY ("trek_id") REFERENCES "trek_packages" ("id") ON DELETE CASCADE;

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "admin_logs" ("id");

ALTER TABLE "blog_posts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "blog_categories" ADD FOREIGN KEY ("id") REFERENCES "blog_posts" ("id");

ALTER TABLE "galleries" ADD FOREIGN KEY ("title") REFERENCES "trek_packages" ("trek_gallery_id");
