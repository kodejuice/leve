import Link from "next/link";
import { parseCookies } from "nookies";
import Toggle from "../home/Toggle";

export function SideBar({ home }) {
  return (
    <div className="position-fixed action-btn">
      <div className="toggler">
        <Toggle />
      </div>

      {parseCookies(null).__token && (
        <div className="mt-4 hide-on-mobile">
          <div title="Dashboard">
            <Link href="admin/list">
              <a className="btn btn-link">
                <span className="glyphicon glyphicon-dashboard" />
              </a>
            </Link>
          </div>

          <div title="Add new post">
            <Link href="admin/edit">
              <a className="btn btn-link">
                {" "}
                <span className="glyphicon glyphicon-plus" />{" "}
              </a>
            </Link>
          </div>
        </div>
      )}

      {!home && (
        <Link href="/">
          <div title="Go Home" className="pt-2">
            <a className="btn btn-link">
              <span className="glyphicon glyphicon-chevron-left" />
            </a>
          </div>
        </Link>
      )}
    </div>
  );
}
