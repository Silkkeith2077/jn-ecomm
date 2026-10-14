import raw from "./categories.json";

export type Category = {
    slug: string;
    name: string;
    paragraphs: string[];
    wordCount: number;
};

export const categories = raw as Category[];

export function categoryBySlug(slug: string) {
    return categories.find((c) => c.slug === slug);
}