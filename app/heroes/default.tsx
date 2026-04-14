/**
 * default.tsx — fallback for the implicit `children` slot in the parallel-route
 * layout (heroes/layout.tsx).
 *
 * Next.js requires every parallel-route slot to have a default export so that
 * during full-page reloads or HMR the router can resolve all slots.  Without
 * this file the children slot becomes "unmatched" and Next.js returns a 404.
 *
 * Returning `null` here is safe: on hard navigations the URL still matches
 * `[...slug]/page.tsx` (or `page.tsx` for the index), so this component is
 * never actually rendered in practice — it only prevents the 404 fallback.
 */
export default function Default() {
	return null
}
