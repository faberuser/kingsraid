/**
 * default.tsx — fallback for the implicit `children` slot in the parallel-route
 * layout (artifacts/layout.tsx).
 *
 * Next.js requires every parallel-route slot to have a default export so that
 * during full-page reloads or HMR the router can resolve all slots.  Without
 * this file the children slot becomes "unmatched" and Next.js returns a 404.
 */
export default function Default() {
	return null
}
