import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerViewComponent } from './viewer-view.component';

describe('ViewerViewComponent', () => {
  let component: ViewerViewComponent;
  let fixture: ComponentFixture<ViewerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
