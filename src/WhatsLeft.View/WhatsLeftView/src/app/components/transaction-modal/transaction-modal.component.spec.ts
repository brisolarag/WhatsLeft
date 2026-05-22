import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionModalComponent } from './transaction-modal.component';
import { DatePipe } from '@angular/common';

describe('TransactionModalComponent', () => {
  let component: TransactionModalComponent;
  let fixture: ComponentFixture<TransactionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionModalComponent],
      providers: [DatePipe]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionModalComponent);
    component = fixture.componentInstance;
    component.transaction = {
      id: '1',
      description: 'Mock transaction',
      amount: 100,
      expected: new Date(),
      tags: [],
      type: 'OUTCOME'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
