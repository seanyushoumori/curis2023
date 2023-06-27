class MyClock extends HTMLElement {
  static styles = `
<style>
// ...
// Some Styles
// ...
</style>
`;
  get template() {
    return `
    ${MyClock.styles}
    <div id="clock"></div>
    `;
  }
  
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = this.template;
    this.init();
  }

  init() {
    const setTime = () => {
      const localeTimeString = new Date().toLocaleTimeString();
      this.shadowRoot.getElementById("clock").innerHTML = localeTimeString;
    };
    setTime();
    setInterval(() => {
      setTime();
    }, 1000);
  }
}

customElements.define("my-clock", MyClock);