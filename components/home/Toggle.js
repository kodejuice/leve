/* eslint-disable react/jsx-pascal-case */
import dynamic from "next/dynamic";
import { parseCookies, setCookie } from "nookies";
import { useEffect, useState } from "react";

import { setTheme } from "../../utils";

// import { Toggle as Toggler } from "react-toggle-component";
const Toggler = dynamic(
  () => import("react-toggle-component").then((t) => t.Toggle),
  {
    ssr: false,
    loading: () => <p> 🌘️ </p>,
  }
);

export default function Toggle(props) {
  const { onSwitch } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    mounted && (
      <div title="toggle" className="mb-3">
        <Toggler
          leftBackgroundColor="#ccc"
          rightBackgroundColor="#333"
          borderColor="#282c34"
          knobColor="white"
          name="t-3"
          radius="3px"
          radiusBackground="2px"
          knobRadius="2px"
          checked={+parseCookies(null).__dark === 1}
          onToggle={(e) => {
            const { checked } = e.target;

            setCookie(null, "__dark", checked ? 1 : 0, {
              path: "/",
              maxAge: 86400 * 86400,
            });

            // change theme
            setTheme(parseCookies(null).__dark);

            // invoke callback after 50ms
            setTimeout(() => {
              if (onSwitch) onSwitch();
            }, 50);
          }}
        />
      </div>
    )
  );
}
