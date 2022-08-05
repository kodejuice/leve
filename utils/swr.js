import _useSWR from "swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function useSWR(u) {
  return _useSWR(u, fetcher);
}
