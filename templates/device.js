// Injects the status bar and home indicator / gesture handle into a screen.
// Provided by app-designer-pro — do not edit. Opt out with <body data-chrome="none">.
(() => {
  const b = document.body;
  if (!b || b.dataset.chrome === "none") return;
  const android = b.dataset.platform === "android";
  const ios = {
    signal: '<svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="7.5" width="3.2" height="4.5" rx="1"/><rect x="5" y="5" width="3.2" height="7" rx="1"/><rect x="10" y="2.5" width="3.2" height="9.5" rx="1"/><rect x="15" y="0" width="3.2" height="12" rx="1"/></svg>',
    wifi: '<svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.6c2.4 0 4.6.9 6.3 2.5l1.2-1.3A10.8 10.8 0 0 0 8.5.8 10.8 10.8 0 0 0 1 3.8l1.2 1.3a9 9 0 0 1 6.3-2.5Zm0 3.7c1.4 0 2.7.5 3.7 1.4l1.2-1.3a7.3 7.3 0 0 0-9.8 0l1.2 1.3c1-.9 2.3-1.4 3.7-1.4Zm0 3.6c-.5 0-.9.2-1.2.5l1.2 1.4 1.2-1.4c-.3-.3-.7-.5-1.2-.5Z"/></svg>',
    battery: '<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.5"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" opacity=".45"/></svg>',
  };
  const droid = {
    wifi: '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 21 0 7.5C3.3 4.7 7.5 3 12 3s8.7 1.7 12 4.5Z"/></svg>',
    signal: '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M2 22 22 2v20Z"/></svg>',
    battery: '<svg width="9" height="16" viewBox="0 0 10 18"><path d="M3 0h4v2h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h2Z"/></svg>',
  };
  const icons = android ? droid.wifi + droid.signal + droid.battery : ios.signal + ios.wifi + ios.battery;
  const sb = document.createElement("div");
  sb.className = "sb";
  sb.setAttribute("aria-hidden", "true");
  sb.innerHTML = `<span>9:41</span><span class="sb-icons">${icons}</span>`;
  const home = document.createElement("div");
  home.className = "home";
  home.setAttribute("aria-hidden", "true");
  b.prepend(sb);
  b.append(home);
})();
