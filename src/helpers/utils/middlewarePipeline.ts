import type { Context, MiddlewareFunction } from '@/helpers/types/functionTypes'

  export default function middlewarePipeline(
    context: Context,
    middleware: MiddlewareFunction[],
    index: number,
  ) {
    const nextMiddleware = middleware[index]

    if (!nextMiddleware) {
      return () => context.next()
    }

    return () => {
      nextMiddleware({
        ...context,
        next: middlewarePipeline(context, middleware, index + 1),
      })
    }
  }
