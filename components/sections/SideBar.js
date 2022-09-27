import Link from "next/link";
import { parseCookies } from "nookies";
import GoBack from "../GoBack";
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
        <div title="Go Back" className="pt-2">
          <GoBack />
        </div>
      )}
    </div>
  );
}
