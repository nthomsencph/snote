CREATE TABLE "entries" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"preview" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"lastUpdated" timestamp,
	"icon" text,
	"index" serial NOT NULL
);
