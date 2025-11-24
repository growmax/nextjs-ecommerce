import slugify from "slugify";

export function slugifyUrl(string = ""): string {
    return slugify(string);
}