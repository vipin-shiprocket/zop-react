import type { Instrumentation } from "next"

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const { default: logger } = await import("./lib/logger")
  const err =
    error instanceof Error
      ? {
          message: error.message,
          stack: error.stack,
          digest: (error as Error & { digest?: string }).digest,
        }
      : { message: String(error) }

  logger.error(
    {
      err,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
    },
    "Server request error",
  )
}
