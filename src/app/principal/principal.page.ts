import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonSpinner,
  IonIcon,
  IonModal,
  IonButtons,
  AlertController
} from '@ionic/angular/standalone';
import { Cadastro, CadastroService } from '../services/cadastro.service';
import { addIcons } from 'ionicons';
import {
  addOutline,
  trashOutline,
  logoWhatsapp,
  printOutline,
  callOutline,
  personOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonSpinner,
    IonIcon,
    IonModal,
    IonButtons
  ],
})
export class PrincipalPage implements OnInit {
  cadastros: Cadastro[] = [];
  carregando = false;

  modalComprovanteAberto = false;
  cadastroSelecionado: Cadastro | null = null;
  dataAtual = new Date();

  constructor(
    private router: Router,
    private cadastroService: CadastroService,
    private alertCtrl: AlertController
  ) {
    addIcons({
      addOutline,
      trashOutline,
      logoWhatsapp,
      printOutline,
      callOutline,
      personOutline,
      timeOutline,
      checkmarkCircleOutline,
      closeOutline
    });
  }

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

  getTotal(cadastro: Cadastro | null): number {
    if (!cadastro || !cadastro.itens) return 0;
    return cadastro.itens.reduce((acc, item) => acc + ((item.quantidade || 0) * (item.preco || 0)), 0);
  }

  getTotalPecas(cadastro: Cadastro | null): number {
    if (!cadastro || !cadastro.itens) return 0;
    return cadastro.itens
      .filter(i => (i.tipo || 'peca') === 'peca')
      .reduce((acc, item) => acc + ((item.quantidade || 0) * (item.preco || 0)), 0);
  }

  getTotalServicos(cadastro: Cadastro | null): number {
    if (!cadastro || !cadastro.itens) return 0;
    return cadastro.itens
      .filter(i => i.tipo === 'servico')
      .reduce((acc, item) => acc + ((item.quantidade || 0) * (item.preco || 0)), 0);
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Aprovado':
        return 'status-aprovado';
      case 'Concluido':
        return 'status-concluido';
      default:
        return 'status-pendente';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'Aprovado':
        return '🟢 Aprovado';
      case 'Concluido':
        return '✔️ Concluído';
      default:
        return '🟡 Pendente';
    }
  }

  abrir(id?: string) {
    if (id) {
      this.router.navigate(['/home', id]);
    }
  }

  novo() {
    this.router.navigate(['/home']);
  }

  async excluir(event: Event, id?: string) {
    event.stopPropagation();
    if (!id) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar exclusão',
      message: 'Deseja realmente excluir este orçamento?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.cadastroService.remover(id).subscribe({
              next: () => {
                this.cadastros = this.cadastros.filter(c => c.id !== id);
              },
              error: (err) => console.error('Erro ao excluir orçamento:', err)
            });
          }
        }
      ]
    });
    await alert.present();
  }

  enviarWhatsApp(event: Event, cadastro: Cadastro) {
    event.stopPropagation();

    const itensTexto = cadastro.itens
      ?.map(i => `• ${i.quantidade}x ${i.nome} (${i.tipo === 'servico' ? 'Mão de Obra' : 'Peça'}): R$ ${((i.quantidade || 0) * (i.preco || 0)).toFixed(2)}`)
      .join('\n') || '';

    const total = this.getTotal(cadastro).toFixed(2);
    const placaTexto = cadastro.placa ? ` (Placa ${cadastro.placa})` : '';
    const saudacao = cadastro.cliente ? `Olá, ${cadastro.cliente}!` : 'Olá!';

    const mensagem = `${saudacao}\nAqui é da *Oficina Pardal* 🏍️\n\nSegue o orçamento para sua *${cadastro.moto}*${placaTexto}:\n\n${itensTexto}\n\n*Total: R$ ${total}*\nStatus: ${cadastro.status || 'Pendente'}\n\nPodemos aprovar o serviço?`;

    const foneLimpo = (cadastro.telefone || '').replace(/\D/g, '');
    let url = '';
    if (foneLimpo.length >= 10) {
      const ddi = foneLimpo.startsWith('55') ? foneLimpo : `55${foneLimpo}`;
      url = `https://wa.me/${ddi}?text=${encodeURIComponent(mensagem)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    }

    window.open(url, '_blank');
  }

  abrirComprovante(event: Event, cadastro: Cadastro) {
    event.stopPropagation();
    this.cadastroSelecionado = cadastro;
    this.modalComprovanteAberto = true;
  }

  fecharComprovante() {
    this.modalComprovanteAberto = false;
    this.cadastroSelecionado = null;
  }

  imprimirComprovante() {
    window.print();
  }
}
