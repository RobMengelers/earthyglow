import { redirect } from 'react-router'

export function loader() {
  return redirect('/admin/overview')
}

export default function AdminIndex() {
  return null
}
