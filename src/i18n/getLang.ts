import { i18nI } from "./interface";
import fs from "fs";
import path from "path";

let langs: { [key: string]: i18nI } = {};

const langsDir = fs.readdirSync(path.resolve("src/i18n/langs"));

langsDir
    .filter(item => item.endsWith(".json"))
    .forEach(item => {
        const langPath = path.resolve("src/i18n/langs/", item);
        const localeName = item.split(".")[0];
        langs[localeName] = JSON.parse(fs.readFileSync(langPath, "utf-8"));

        console.log(`Loaded language: ${item}`);
    })

export function getLang(locale: string): i18nI {
    return langs[locale] ?? langs["en"];
}

export function formatString(baseString: string, vars: any[]): string {
    for (const [key, item] of vars.entries()) {
        const replacable = `{${key}}`;
        baseString = baseString.replace(replacable, item);
    }
    return baseString;
}