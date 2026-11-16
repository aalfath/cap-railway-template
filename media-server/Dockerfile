# Cap media server (FFmpeg processing for uploads, thumbnails and imports).
# Official image built by CapSoftware from main, commit ca4e8a74a (2026-11-16).
# Upstream publishes this server only under a moving tag, so we pin the build by digest.
FROM ghcr.io/capsoftware/cap-media-server@sha256:f510bd041e7cc3cb4fcb2f89bef76967639f4e6af714553d439927f818ac76d8

ENV PORT=3456
EXPOSE 3456

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["bun", "run", "src/index.ts"]
