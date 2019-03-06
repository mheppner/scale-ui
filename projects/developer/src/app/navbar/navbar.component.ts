import { Component, ViewChild } from '@angular/core';

@Component({
    selector: 'dev-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent {
    @ViewChild('themePanel') themePanel: any;
    @ViewChild('menu') menu: any;
    selectedId = null;
    subscription: any;
    isLight = true;
    themeTooltip = 'Switch to Dark Theme';
    themeIcon = 'fa fa-moon-o';

    constructor() {}

    selectNavItem(event, itemId) {
        event.stopPropagation();
        if (this.selectedId === itemId) {
            // close it
            this.selectedId = null;
        } else {
            this.selectedId = itemId;
        }
    }

    getNavItemStyles(itemId) {
        if (this.selectedId === itemId) {
            return 'navbar__item-selected';
        }
        return 'navbar__item';
    }

    onNavigate() {
        // close the subnav
        this.selectedId = null;
    }

    changeTheme() {
        const themeLink: HTMLLinkElement = <HTMLLinkElement> document.getElementById('theme-css');
        this.isLight = !this.isLight;
        this.themeTooltip = this.isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme';
        this.themeIcon = this.isLight ? 'fa fa-moon-o' : 'fa fa-sun-o';
        const theme = this.isLight ? 'light' : 'dark';
        themeLink.href = `assets/themes/${theme}.css`;
    }
}
