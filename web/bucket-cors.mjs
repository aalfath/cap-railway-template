// Sets the storage bucket's CORS rule so browsers on WEB_URL can upload
// recordings (web recorder, Chrome extension) and read the ETag header,
// as Cap's self-hosting docs require. Runs on every start and never blocks it.
// Plain Node (no dependencies): signs a PutBucketCors request with AWS SigV4.
import { createHash, createHmac } from "node:crypto";

const env = process.env;
const log = (m) => console.log(`[bucket-cors] ${m}`);

async function main() {
	if ((env.CAP_SET_BUCKET_CORS ?? "true") !== "true") return log("skipped (CAP_SET_BUCKET_CORS is not true)");
	const endpoint = env.S3_INTERNAL_ENDPOINT || env.S3_PUBLIC_ENDPOINT;
	const bucket = env.CAP_AWS_BUCKET;
	const key = env.CAP_AWS_ACCESS_KEY;
	const secret = env.CAP_AWS_SECRET_KEY;
	const region = env.CAP_AWS_REGION || "us-east-1";
	if (!endpoint || !bucket || !key || !secret) return log("skipped (bucket settings incomplete)");

	const origins = new Set();
	for (const u of [env.WEB_URL, env.RAILWAY_PUBLIC_DOMAIN && `https://${env.RAILWAY_PUBLIC_DOMAIN}`]) {
		try { if (u) origins.add(new URL(u).origin); } catch {}
	}
	for (const o of (env.CAP_BUCKET_CORS_ORIGINS || "").split(",")) if (o.trim()) origins.add(o.trim());
	if (origins.size === 0) return log("skipped (no origin)");

	const base = new URL(endpoint);
	const pathStyle = env.S3_PATH_STYLE === "true";
	const host = pathStyle ? base.host : `${bucket}.${base.host}`;
	const path = pathStyle ? `/${encodeURIComponent(bucket)}` : "/";
	const body =
		"<CORSConfiguration><CORSRule>" +
		[...origins].map((o) => `<AllowedOrigin>${o}</AllowedOrigin>`).join("") +
		["GET", "HEAD", "PUT", "POST"].map((m) => `<AllowedMethod>${m}</AllowedMethod>`).join("") +
		"<AllowedHeader>*</AllowedHeader><ExposeHeader>ETag</ExposeHeader><MaxAgeSeconds>3000</MaxAgeSeconds>" +
		"</CORSRule></CORSConfiguration>";

	const sha = (d) => createHash("sha256").update(d).digest("hex");
	const hmac = (k, d) => createHmac("sha256", k).update(d).digest();
	const now = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
	const day = now.slice(0, 8);
	const payloadHash = sha(body);
	const md5 = createHash("md5").update(body).digest("base64");
	const headers = { "content-md5": md5, "content-type": "application/xml", host, "x-amz-content-sha256": payloadHash, "x-amz-date": now };
	const names = Object.keys(headers).sort();
	const canonical = ["PUT", path, "cors=", names.map((n) => `${n}:${headers[n]}\n`).join(""), names.join(";"), payloadHash].join("\n");
	const scope = `${day}/${region}/s3/aws4_request`;
	const toSign = ["AWS4-HMAC-SHA256", now, scope, sha(canonical)].join("\n");
	const signingKey = hmac(hmac(hmac(hmac(`AWS4${secret}`, day), region), "s3"), "aws4_request");
	const signature = createHmac("sha256", signingKey).update(toSign).digest("hex");
	const auth = `AWS4-HMAC-SHA256 Credential=${key}/${scope}, SignedHeaders=${names.join(";")}, Signature=${signature}`;

	const { host: _h, ...sendHeaders } = headers;
	const res = await fetch(`${base.protocol}//${host}${path}?cors=`, {
		method: "PUT",
		headers: { ...sendHeaders, authorization: auth },
		body,
		signal: AbortSignal.timeout(15000),
	});
	if (res.ok) log(`set for ${[...origins].join(", ")}`);
	else log(`not set: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
}

main().catch((e) => log(`not set: ${e.message}`));
