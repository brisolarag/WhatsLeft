import { Component, signal, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('WhatsLeftView');

  isCommandCentralOpen = false;
  private lastHPressTime = 0;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Ignora inputs e textareas para não interferir na digitação
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    if (this.isCommandCentralOpen && event.key === 'Escape') {
      this.isCommandCentralOpen = false;
      return;
    }

    if (event.key.toLowerCase() === 'h') {
      const now = Date.now();
      // Se 'h' for pressionado duas vezes em menos de 400ms
      if (now - this.lastHPressTime < 400) {
        this.isCommandCentralOpen = !this.isCommandCentralOpen;
        this.lastHPressTime = 0; // reseta
      } else {
        this.lastHPressTime = now;
      }
    }
  }

  closeModal() {
    this.isCommandCentralOpen = false;
  }
}
