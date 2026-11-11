import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonButton, IonBadge, IonSpinner } from '@ionic/angular/standalone';
import { Cadastro, CadastroService } from '../services/cadastro.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonButton, IonBadge, IonSpinner],
})
export class PrincipalPage implements OnInit {
  cadastros: Cadastro[] = [];
  carregando = false;

  constructor(
    private router: Router,
    private cadastroService: CadastroService
  ) {}

  ngOnInit() {
    this.carregar();
  }

  ionViewWillEnter() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.cadastroService.listar().subscribe({
      next: (dados) => {
        this.cadastros = dados;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao buscar orçamentos da API:', err);
        this.carregando = false;
      }
    });
  }

  getTotal(cadastro: any): number {
    if (!cadastro || !cadastro.itens) return 0;
    return cadastro.itens.reduce((acc: number, item: any) => acc + ((item.quantidade || 0) * (item.preco || 0)), 0);
  }

  abrir(id?: string) {
    if (id) {
      this.router.navigate(['/home', id]);
    }
  }

  novo() {
    this.router.navigate(['/home']);
  }

  excluir(event: Event, id?: string) {
    event.stopPropagation();
    if (!id) return;
    this.cadastroService.remover(id).subscribe({
      next: () => {
        this.cadastros = this.cadastros.filter(c => c.id !== id);
      },
      error: (err) => console.error('Erro ao excluir orçamento:', err)
    });
  }
}