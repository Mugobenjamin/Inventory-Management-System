import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useRoles() {
  const { data, error } = useSWR('/api/me/roles', fetcher)
  return {
    roles: data?.roles ?? [],
    loading: !error && !data,
    error,
  }
}
