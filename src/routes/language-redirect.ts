import type { ClientLoaderFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { clientLanguageRedirect, languageRedirect } from '../i18n/redirect'

// "/" has no page of its own: it forwards to /nl, /en or /de.
export function loader({ request, context }: LoaderFunctionArgs) {
  throw languageRedirect(request, context)
}

export function clientLoader({ request }: ClientLoaderFunctionArgs) {
  throw clientLanguageRedirect(request)
}
