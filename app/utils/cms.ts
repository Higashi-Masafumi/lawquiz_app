import { createClient } from "microcms-js-sdk";

export const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
    apiKey: process.env.MICROCMS_API_KEY!,
});
console.log(process.env.MICROCMS_SERVICE_DOMAIN);
console.log(process.env.MICROCMS_API_KEY);

export const fetchPostContent = async (slug: string) => {
    const data = await client.get({
        endpoint: "posts",
        queries: { filters: `slug[equals]${slug}` },
    });
    console.log(data);
    return data;
}