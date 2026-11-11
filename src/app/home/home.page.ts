import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonItem, IonIcon, IonBadge, IonButtons, IonBackButton, ToastController, AlertController } from '@ionic/angular/standalone';
import { Cadastro, CadastroService, ItemCadastro } from '../services/cadastro.service';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonItem, IonIcon, IonBadge, IonButtons, IonBackButton],
})
export class HomePage implements OnInit {
  moto: string = '';
  itens: ItemCadastro[] = [
    { nome: '', quantidade: 1, preco: 0 }
  ];
  
  editId: string | null = null;
  isEditing: boolean = false;
  salvando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cadastroService: CadastroService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ addOutline, trashOutline });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = idParam;
      this.isEditing = true;
      this.cadastroService.obter(this.editId).subscribe({
        next: (cadastro) => {
          if (cadastro) {
            this.moto = cadastro.moto;
            this.itens = cadastro.itens?.length
              ? cadastro.itens.map(i => ({ ...i }))
              : [{ nome: '', quantidade: 1, preco: 0 }];
          }
        },
        error: (err) => console.error('Erro ao obter orçamento da API:', err)
      });
    }
  }

  adicionarItem() {
    this.itens.push({ nome: '', quantidade: 1, preco: 0 });
  }

  removerItem(index: number) {
    this.itens.splice(index, 1);
    if (this.itens.length === 0) {
      this.adicionarItem();
    }
  }

  async mostrarToast(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2500,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  async mostrarAlerta(titulo: string, mensagem: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK']
    });
    await alert.present();
  }

  enviar() {
    const moto = this.moto.trim();
    // Mantém apenas os itens preenchidos
    const itensValidos = this.itens.filter(i => i.nome.trim() !== '' || i.preco !== null || i.quantidade !== null);
    const itensParaSalvar = itensValidos.length > 0 ? itensValidos : this.itens;

    const cadastroFinal: Cadastro = {
      moto: moto || 'Sem Moto',
      itens: itensParaSalvar
    };

    this.salvando = true;

    if (this.isEditing && this.editId) {
      cadastroFinal.id = this.editId;
      this.cadastroService.atualizar(this.editId, cadastroFinal).subscribe({
        next: () => {
          this.salvando = false;
          this.mostrarToast('Orçamento atualizado com sucesso!');
          this.finalizar();
        },
        error: (err) => {
          console.error('Erro ao atualizar orçamento:', err);
          this.salvando = false;
          const detalhe = err.error?.message || err.error?.title || (typeof err.error === 'string' ? err.error : null) || err.message || 'Erro de conexão';
          this.mostrarAlerta(`Erro (${err.status || 'Rede'})`, detalhe);
        }
      });
    } else {
      this.cadastroService.adicionar(cadastroFinal).subscribe({
        next: () => {
          this.salvando = false;
          this.mostrarToast('Orçamento cadastrado com sucesso!');
          this.finalizar();
        },
        error: (err) => {
          console.error('Erro ao cadastrar orçamento:', err);
          this.salvando = false;
          const detalhe = err.error?.message || err.error?.title || (typeof err.error === 'string' ? err.error : null) || err.message || 'Erro de conexão';
          this.mostrarAlerta(`Erro (${err.status || 'Rede'})`, detalhe);
        }
      });
    }
  }

  private finalizar() {
    this.moto = '';
    this.itens = [{ nome: '', quantidade: 1, preco: 0 }];
    this.isEditing = false;
    this.editId = null;
    this.router.navigate(['/principal']);
  }
}