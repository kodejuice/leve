import { useState } from "react";

export default function SignupForm() {
  const [email, setEmail] = useState("");

  return (
    <div id="mc_embed_signup" className="signup-form-container">
      <form
        action="https://api.follow.it/subscription-form/UXRlWW5xYWd4eUlURm9KQ0ZMMUFzUmtoTGRpWkRaOWp5VUpIckFkNFBqb2s5RFlCNDlZTkNHNXJhZU5aRmY3OWd3SUdYbVhncS91OHZ2dzVBQmNmTjVPZnZyZGxQRHdkczlBQytvbkhLYzNEVG0vSk9wVXZPVDZyNmoyTGdxdFF8dERFdFVkSHBGTTJ6c2ZqQ3piMlhvQVFJK1pzV2xlQzY5eWFCM3RmMS94ST0=/8"
        method="post"
        target="_blank"
        className="signup-form"
      >
        <div id="mc_embed_signup_scroll">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            placeholder="Enter your email address..."
            className="email-input"
            required
            spellCheck="false"
          />
          <button type="submit" className="submit-button button-text">
            Subscribe
          </button>
        </div>
      </form>
    </div>
  );
}
