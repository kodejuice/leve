/* eslint-disable react/jsx-pascal-case */
import { parseCookies, setCookie } from "nookies";
import { useEffect, useState } from "react";
import { Toggle as _Toggle } from "react-toggle-component";

import { setTheme } from "../../utils";

export default function Toggle(props) {
  const { onSwitch } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    mounted && (
      <div title="toggle">
        <_Toggle
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
            if (onSwitch) onSwitch();
            const { checked } = e.target;

            setCookie(null, "__dark", checked ? 1 : 0, {
              path: "/",
              maxAge: 86400 * 86400,
            });

            setTheme(parseCookies(null).__dark);
          }}
        />
      </div>
    )
  );
}
