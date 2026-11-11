import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonLabel, IonInput, IonItem } from '@ionic/angular/standalone';

@Component({
  selector: 'app-anotacoes',
  templateUrl: './anotacoes.page.html',
  styleUrls: ['./anotacoes.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonLabel, IonInput, IonItem]
})
export class AnotacoesPage implements OnInit {
  notas: string = '';

  get text(): string {
    return this.notas;
  }
  set text(value: string) {
    this.notas = value;
  }

  constructor(private router: Router) { }

  ngOnInit() {
  }
  salvarAnotacoes(){
    this.router.navigate(['/home'])
  }

}
