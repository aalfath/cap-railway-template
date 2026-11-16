# Cap Web (dashboard, sharing pages, upload API).
# Official image built by CapSoftware from main, commit f415c09c5 (2026-11-16).
# Upstream publishes the server only under moving tags, so we pin the build by digest.
FROM ghcr.io/capsoftware/cap-web:candidate-f415c09c5@sha256:b93679f183fa5ce417e03d0b59dd9bdf094d5491cacf291dbada3fc024b82718

COPY --chown=nextjs:nodejs --chmod=755 start.sh /app/railway-start.sh

ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["/app/railway-start.sh"]
