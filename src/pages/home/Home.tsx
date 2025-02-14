import type { ReactNode } from "react"
import "./Home.scss"

function Home(): ReactNode {
  return (
    <div className="home">
      <section className="home__section">
        <h1 className="gradient-heading">Design System Demo</h1>
        <p>
          Welcome to our comprehensive design system showcase. This page demonstrates our typography, colors,
          components, and utility classes.
        </p>
      </section>

      <section className="home__section">
        <h2>Typography</h2>
        <h1>Heading 1 - The quick brown fox</h1>
        <h2>Heading 2 - Jumps over the lazy dog</h2>
        <h3>Heading 3 - Pack my box with five dozen liquor jugs</h3>
        <h4>Heading 4 - How vexingly quick daft zebras jump</h4>
        <h5>Heading 5 - The five boxing wizards jump quickly</h5>
        <h6>Heading 6 - Sphinx of black quartz, judge my vow</h6>

        <p>
          Regular paragraph text with <strong>bold text</strong>, <em>italic text</em>, and <a href="#">linked text</a>.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>

        <code>This is inline code</code>

        <pre>
          <code>{`function example() {
  return "This is a code block";
}`}</code>
        </pre>
      </section>

      <section className="home__section">
        <h2>Components</h2>

        <div className="home__buttons">
          <button className="home__button home__button--primary">Primary Button</button>
          <button className="home__button home__button--positive">Success Button</button>
          <button className="home__button home__button--negative">Danger Button</button>
        </div>

        <div className="home__grid">
          <div className="home__card">
            <h3>Regular Card</h3>
            <p>Basic card component</p>
          </div>
          <div className="home__card home__card--glass-light">
            <h3>Light Glass</h3>
            <p>Subtle glassmorphism</p>
          </div>
          <div className="home__card home__card--glass-default">
            <h3>Default Glass</h3>
            <p>Standard glassmorphism</p>
          </div>
          <div className="home__card home__card--glass-heavy">
            <h3>Heavy Glass</h3>
            <p>Pronounced glassmorphism</p>
          </div>
          <div className="home__hover-card">
            <h3>Hover Card</h3>
            <p>Hover to see animation</p>
          </div>
        </div>
      </section>

      <section className="home__section">
        <h2>Colors</h2>
        <div className="home__color-grid">
          <div className="color-box" style={{ background: "var(--color-primary)" }}>
            Primary
          </div>
          <div className="color-box" style={{ background: "var(--color-primary-light)" }}>
            Primary Light
          </div>
          <div className="color-box" style={{ background: "var(--color-primary-dark)" }}>
            Primary Dark
          </div>
          <div className="color-box" style={{ background: "var(--color-success)" }}>
            Success
          </div>
          <div className="color-box" style={{ background: "var(--color-error)" }}>
            Error
          </div>
          <div className="color-box" style={{ background: "var(--color-warning)" }}>
            Warning
          </div>
        </div>
      </section>

      <section className="home__section">
        <h2>Gradient Backgrounds</h2>
        <div className="home__gradient-grid">
          <div className="gradient-box gradient-box--default">Default Gradient</div>
          <div className="gradient-box gradient-box--blue">Blue Gradient</div>
          <div className="gradient-box gradient-box--purple">Purple Gradient</div>
          <div className="gradient-box gradient-box--happy">Happy Gradient</div>
          <div className="gradient-box gradient-box--calm">Calm Gradient</div>
        </div>
      </section>

      <section className="home__section">
        <h2>Text Utilities</h2>
        <p className="text-xs">Extra Small Text</p>
        <p className="text-sm">Small Text</p>
        <p className="text-base">Base Text</p>
        <p className="text-lg">Large Text</p>
        <p className="text-xl">Extra Large Text</p>
        <p className="text-primary">Primary Color Text</p>
        <p className="uppercase">Uppercase Text</p>
        <p className="font-bold">Bold Text</p>
      </section>

      <section className="home__section">
        <h2>Interactive Elements</h2>

        <div className="home__interactive-grid">
          <div className="home__fade-card" role="article">
            <h3>Fade In Animation</h3>
            <p>This card fades in on load</p>
          </div>

          <div className="home__hover-scale" role="article">
            <h3>Scale on Hover</h3>
            <p>This card scales up</p>
          </div>

          <div className="home__emotion-card home__emotion-card--happy" role="article">
            <h3>Emotional Context</h3>
            <p>Card with emotional styling</p>
          </div>
        </div>
      </section>

      <section className="home__section">
        <h2>Text Effects</h2>

        <div className="home__text-effects">
          <p className="gradient-text">Gradient Text Effect</p>
          <p className="animated-text">Animated Text Effect</p>
          <a href="#" className="underline-animation">
            Underline Animation
          </a>
          <p className="text-shadow">Text with Shadow</p>
        </div>
      </section>

      <section className="home__section">
        <h2>Focus & Selection States</h2>

        <div className="home__focus-demo">
          <div className="focus-demo-group">
            <h4>Focus States</h4>
            <button className="focus-demo-button">Tab to me!</button>
            <input type="text" className="focus-demo-input" placeholder="Click or tab to focus..." />
          </div>

          <div className="selection-demo-group">
            <h4>Selection Effect</h4>
            <p className="selection-demo-text">
              Try selecting this text to see the custom selection styling. The background and text colors will change to
              match our design system.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
