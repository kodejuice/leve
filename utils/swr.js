import _useSWR from "swr";

const fetcher = (arg) =>
  fetch(arg, {
    mode: "no-cors",
  }).then((res) => res.json());

export default function useSWR(u) {
  return _useSWR(u, fetcher);
}
