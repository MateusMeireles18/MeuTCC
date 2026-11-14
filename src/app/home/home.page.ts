import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonIcon,
  IonBadge,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { Cadastro, CadastroService, ItemCadastro, StatusOrcamento, TipoItem } from '../services/cadastro.service';
import { addIcons } from 'ionicons';
import {
  addOutline,
  trashOutline,
  constructOutline,
  cubeOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  personOutline,
  callOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonItem,
    IonIcon,
    IonBadge,
    IonButtons,
    IonBackButton,
    IonSegment,
    IonSegmentButton,
    IonLabel
  ],
})
export class HomePage implements OnInit {
  moto: string = '';
  placa: string = '';
  cliente: string = '';
  telefone: string = '';
  status: StatusOrcamento = 'Pendente';

  itens: ItemCadastro[] = [
    { nome: '', quantidade: 1, preco: 0, tipo: 'peca' }
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
    addIcons({
      addOutline,
      trashOutline,
      constructOutline,
      cubeOutline,
      checkmarkCircleOutline,
      timeOutline,
      alertCircleOutline,
      personOutline,
      callOutline
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = idParam;
      this.isEditing = true;
      this.cadastroService.obter(this.editId).subscribe({
        next: (cadastro) => {
          if (cadastro) {
            this.moto = cadastro.moto || '';
            this.placa = cadastro.placa || '';
            this.cliente = cadastro.cliente || '';
            this.telefone = cadastro.telefone || '';
            this.status = cadastro.status || 'Pendente';
            this.itens = cadastro.itens?.length
              ? cadastro.itens.map(i => ({ ...i, tipo: i.tipo || 'peca' }))
              : [{ nome: '', quantidade: 1, preco: 0, tipo: 'peca' }];
          }
        },
        error: (err) => console.error('Erro ao obter orçamento da API:', err)
      });
    }
  }

  formatarPlaca() {
    if (this.placa) {
      this.placa = this.placa.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    }
  }

  adicionarItem(tipo: TipoItem = 'peca') {
    this.itens.push({ nome: '', quantidade: 1, preco: 0, tipo });
  }

  removerItem(index: number) {
    this.itens.splice(index, 1);
    if (this.itens.length === 0) {
      this.adicionarItem();
    }
  }

  mudarTipoItem(item: ItemCadastro, tipo: TipoItem) {
    item.tipo = tipo;
  }

  getTotalPecas(): number {
    return this.itens
      .filter(i => (i.tipo || 'peca') === 'peca')
      .reduce((acc, item) => acc + ((item.quantidade || 0) * (item.preco || 0)), 0);
  }

  getTotalServicos(): number {
    return this.itens
      .filter(i => i.tipo === 'servico')
      .reduce((acc, item) => acc + ((item.quantidade || 0) * (item.preco || 0)), 0);
  }

  getTotalGeral(): number {
    return this.itens.reduce((acc, item) => acc + ((item.quantidade || 0) * (item.preco || 0)), 0);
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
    if (!moto) {
      this.mostrarAlerta('Atenção', 'Informe o modelo da moto.');
      return;
    }

    const itensValidos = this.itens.filter(i => (i.nome && i.nome.trim() !== '') || i.preco > 0);
    const itensParaSalvar = itensValidos.length > 0 ? itensValidos : this.itens;

    const cadastroFinal: Cadastro = {
      moto,
      placa: this.placa.trim().toUpperCase(),
      cliente: this.cliente.trim(),
      telefone: this.telefone.trim(),
      status: this.status,
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
    this.placa = '';
    this.cliente = '';
    this.telefone = '';
    this.status = 'Pendente';
    this.itens = [{ nome: '', quantidade: 1, preco: 0, tipo: 'peca' }];
    this.isEditing = false;
    this.editId = null;
    this.router.navigate(['/principal']);
  }
}
