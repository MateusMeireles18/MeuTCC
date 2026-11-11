import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Cadastro, CadastroService } from '../services/cadastro.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalhe',
  templateUrl: './detalhe.page.html',
  styleUrls: ['./detalhe.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonList, IonItem, IonLabel],
})
export class DetalhePage {
  cadastro?: Cadastro;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cadastroService: CadastroService
  ) {
    const indice = Number(this.route.snapshot.paramMap.get('id'));
    this.cadastro = this.cadastroService.obter(indice);

    if (!this.cadastro) {
      this.router.navigate(['/principal']);
    }
  }
}