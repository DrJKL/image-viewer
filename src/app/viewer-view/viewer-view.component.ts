import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'iv-viewer-view',
  standalone: true,
  imports: [],
  templateUrl: './viewer-view.component.html',
  styleUrl: './viewer-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerViewComponent {

}
