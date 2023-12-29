import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'iv-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToolbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ImageViewer';
}
