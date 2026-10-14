import raw from "./categories.json";

export type Block = { type: "h2" | "h3" | "p" | "li"; text: string };
export type Category = { slug: string; name: string; blocks: Block[]; wordCount: number };

export const categories = raw as Category[];

export function categoryBySlug(slug: string) {
    return categories.find((c) => c.slug === slug);
}

export function leadParagraph(c: Category) {
    return c.blocks.find((b) => b.type === "p")?.text ?? "";
}