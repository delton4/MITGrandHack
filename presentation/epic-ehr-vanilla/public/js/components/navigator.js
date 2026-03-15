// Epic EHR — Navigator (Left Chart Menu)
const Navigator = {
  items: [
    { id: 'synopsis', icon: '&#127968;', label: 'Summary' },
    { id: 'notes', icon: '&#9998;', label: 'Notes' },
    { id: 'results', icon: '&#9879;', label: 'Results Review' },
    { id: 'orders', icon: '&#128203;', label: 'Orders' },
    { id: 'mar', icon: '&#128138;', label: 'MAR' },
    { id: 'flowsheet', icon: '&#9638;', label: 'Flowsheets' },
    { id: 'problems', icon: '&#9776;', label: 'Problem List' },
    { id: 'imaging', icon: '&#128248;', label: 'Imaging' },
    { id: 'neotherm', icon: '&#127777;', label: 'NeoTherm', isNeotherm: true },
  ],

  render(el, activeItem) {
    const nav = document.createElement('div');
    nav.className = 'navigator';

    this.items.forEach(item => {
      const navItem = document.createElement('div');
      navItem.className = `nav-item ${item.id === activeItem ? 'active' : ''} ${item.isNeotherm ? 'neotherm-item' : ''}`;
      navItem.innerHTML = `
        <span class="nav-item-icon">${item.icon}</span>
        <span>${item.label}</span>
      `;
      navItem.addEventListener('click', () => App.setNavItem(item.id));
      nav.appendChild(navItem);
    });

    el.appendChild(nav);
  }
};
