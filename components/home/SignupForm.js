import { useState } from "react";

export default function SignupForm() {
  const [email, setEmail] = useState("");

  return (
    <div id="mc_embed_signup">
      <form
        action="https://sochima.us13.list-manage.com/subscribe/post?u=59b59168364f415f6f1c05a6c&amp;id=c5d697a59e&amp;f_id=006cdce2f0"
        method="post"
        id="mc-embedded-subscribe-form"
        name="mc-embedded-subscribe-form"
        className="validate"
        target="_blank"
      >
        <div id="mc_embed_signup_scroll">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="EMAIL"
            className="email-input"
            id="mce-EMAIL"
            required
          />
          <div
            style={{ position: "absolute", left: "-5000px" }}
            aria-hidden="true"
          >
            <input
              type="text"
              name="b_59b59168364f415f6f1c05a6c_c5d697a59e"
              tabIndex="-1"
              value=""
              readOnly
            />
          </div>
          <input
            type="submit"
            value="Subscribe"
            name="subscribe"
            id="mc-embedded-subscribe"
            className="submit-button button-text"
          />
        </div>
      </form>
    </div>
  );
}
