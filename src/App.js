import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Separator } from './components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Label } from './components/ui/label';
import { Switch } from './components/ui/switch';
import { Textarea } from './components/ui/textarea';
import { 
  Smartphone, 
  Shield, 
  Calendar, 
  Tag, 
  User, 
  Settings, 
  LogOut, 
  Plus,
  Clock,
  DollarSign,
  Phone
} from 'lucide-react';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

console.log('API_URL:', API_URL);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Client data
  const [servicos, setServicos] = useState([]);
  const [promocoes, setPromocoes] = useState([]);
  
  // Admin data
  const [allClientes, setAllClientes] = useState([]);
  const [allServicos, setAllServicos] = useState([]);
  
  // Forms
  const [clienteForm, setClienteForm] = useState({
    nome: '', cpf: '', telefone: '', email: ''
  });
  const [servicoForm, setServicoForm] = useState({
    cliente_cpf: '', nome_aparelho: '', imei: '', cor: '', tipo_servico: '',
    data_servico: '', data_fim_garantia: '', valor_servico: 0,
    tem_seguro: false, valor_seguro: 0
  });
  const [promocaoForm, setPromocaoForm] = useState({
    titulo: '', descricao: '', desconto: '', data_validade: '', ativa: true
  });

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleLogin = async () => {
    if (!cpf) {
      setError('Digite seu CPF');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check admin access first
      if (cpf === '00000000000') {
        setIsAdmin(true);
        setIsLoggedIn(true);
        setCurrentUser({ nome: 'Administrador', cpf: '000.000.000-00' });
        await loadAdminData();
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.cliente);
        setIsLoggedIn(true);
        await loadClientData(cpf);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão');
    }

    setLoading(false);
  };

  const loadClientData = async (clientCpf) => {
    try {
      const [servicosRes, promocoesRes] = await Promise.all([
        fetch(`${API_URL}/api/cliente/${clientCpf}/servicos`),
        fetch(`${API_URL}/api/promocoes`)
      ]);

      if (servicosRes.ok) {
        setServicos(await servicosRes.json());
      }
      if (promocoesRes.ok) {
        setPromocoes(await promocoesRes.json());
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const loadAdminData = async () => {
    try {
      const [clientesRes, servicosRes, promocoesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/clientes`),
        fetch(`${API_URL}/api/admin/servicos`),
        fetch(`${API_URL}/api/promocoes`)
      ]);

      if (clientesRes.ok) setAllClientes(await clientesRes.json());
      if (servicosRes.ok) setAllServicos(await servicosRes.json());
      if (promocoesRes.ok) setPromocoes(await promocoesRes.json());
    } catch (err) {
      console.error('Erro ao carregar dados admin:', err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentUser(null);
    setCpf('');
    setServicos([]);
    setPromocoes([]);
    setAllClientes([]);
    setAllServicos([]);
    setError('');
  };

  const createCliente = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteForm)
      });

      if (response.ok) {
        setClienteForm({ nome: '', cpf: '', telefone: '', email: '' });
        await loadAdminData();
      }
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
    }
  };

  const createServico = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/servico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servicoForm)
      });

      if (response.ok) {
        setServicoForm({
          cliente_cpf: '', nome_aparelho: '', imei: '', cor: '', tipo_servico: '',
          data_servico: '', data_fim_garantia: '', valor_servico: 0,
          tem_seguro: false, valor_seguro: 0
        });
        await loadAdminData();
      }
    } catch (err) {
      console.error('Erro ao criar serviço:', err);
    }
  };

  const createPromocao = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/promocao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promocaoForm)
      });

      if (response.ok) {
        setPromocaoForm({ titulo: '', descricao: '', desconto: '', data_validade: '', ativa: true });
        await loadAdminData();
      }
    } catch (err) {
      console.error('Erro ao criar promoção:', err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <Smartphone className="logo-icon" />
              <h1>Snap Cell Store</h1>
            </div>
            <p>Acesse sua conta com seu CPF</p>
          </div>
          
          <div className="login-form">
            <div className="input-group">
              <Input
                placeholder="Digite seu CPF"
                value={formatCPF(cpf)}
                onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                maxLength="14"
                className="cpf-input"
              />
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <Button 
              onClick={handleLogin} 
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-title">
            <Settings className="admin-icon" />
            <h1>Painel Administrativo - Snap Cell Store</h1>
          </div>
          <Button onClick={handleLogout} variant="outline" className="logout-btn">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="clientes" className="admin-tabs">
          <TabsList className="admin-tabs-list">
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="promocoes">Promoções</TabsTrigger>
          </TabsList>

          <TabsContent value="clientes" className="admin-content">
            <div className="admin-section">
              <div className="section-header">
                <h2>Gerenciar Clientes</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="add-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="form-grid">
                      <div>
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                          id="nome"
                          value={clienteForm.nome}
                          onChange={(e) => setClienteForm({...clienteForm, nome: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          value={clienteForm.cpf}
                          onChange={(e) => setClienteForm({...clienteForm, cpf: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={clienteForm.telefone}
                          onChange={(e) => setClienteForm({...clienteForm, telefone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={clienteForm.email}
                          onChange={(e) => setClienteForm({...clienteForm, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={createCliente}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="data-grid">
                {allClientes.map((cliente) => (
                  <Card key={cliente.id || cliente._id} className="data-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-8 h-8 text-yellow-500" />
                        <div>
                          <h3 className="font-semibold">{cliente.nome}</h3>
                          <p className="text-sm text-gray-600">CPF: {formatCPF(cliente.cpf)}</p>
                          {cliente.telefone && <p className="text-sm text-gray-600">Tel: {cliente.telefone}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="servicos" className="admin-content">
            <div className="admin-section">
              <div className="section-header">
                <h2>Gerenciar Serviços</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="add-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Serviço</DialogTitle>
                    </DialogHeader>
                    <div className="form-grid">
                      <div>
                        <Label htmlFor="cliente_cpf">CPF do Cliente</Label>
                        <Input
                          id="cliente_cpf"
                          value={servicoForm.cliente_cpf}
                          onChange={(e) => setServicoForm({...servicoForm, cliente_cpf: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nome_aparelho">Nome do Aparelho</Label>
                        <Input
                          id="nome_aparelho"
                          value={servicoForm.nome_aparelho}
                          onChange={(e) => setServicoForm({...servicoForm, nome_aparelho: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="imei">IMEI</Label>
                        <Input
                          id="imei"
                          value={servicoForm.imei}
                          onChange={(e) => setServicoForm({...servicoForm, imei: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cor">Cor</Label>
                        <Input
                          id="cor"
                          value={servicoForm.cor}
                          onChange={(e) => setServicoForm({...servicoForm, cor: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipo_servico">Tipo de Serviço</Label>
                        <Input
                          id="tipo_servico"
                          value={servicoForm.tipo_servico}
                          onChange={(e) => setServicoForm({...servicoForm, tipo_servico: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="data_servico">Data do Serviço</Label>
                        <Input
                          id="data_servico"
                          type="date"
                          value={servicoForm.data_servico}
                          onChange={(e) => setServicoForm({...servicoForm, data_servico: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="data_fim_garantia">Fim da Garantia</Label>
                        <Input
                          id="data_fim_garantia"
                          type="date"
                          value={servicoForm.data_fim_garantia}
                          onChange={(e) => setServicoForm({...servicoForm, data_fim_garantia: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="valor_servico">Valor do Serviço</Label>
                        <Input
                          id="valor_servico"
                          type="number"
                          step="0.01"
                          value={servicoForm.valor_servico}
                          onChange={(e) => setServicoForm({...servicoForm, valor_servico: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="tem_seguro"
                          checked={servicoForm.tem_seguro}
                          onCheckedChange={(checked) => setServicoForm({...servicoForm, tem_seguro: checked})}
                        />
                        <Label htmlFor="tem_seguro">Tem Seguro (6 meses)</Label>
                      </div>
                      {servicoForm.tem_seguro && (
                        <div>
                          <Label htmlFor="valor_seguro">Valor do Seguro</Label>
                          <Input
                            id="valor_seguro"
                            type="number"
                            step="0.01"
                            value={servicoForm.valor_seguro}
                            onChange={(e) => setServicoForm({...servicoForm, valor_seguro: parseFloat(e.target.value)})}
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={createServico}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="data-grid">
                {allServicos.map((servico) => (
                  <Card key={servico.id || servico._id} className="data-card">
                    <CardContent className="p-4">
                      <div className="service-info">
                        <div className="flex items-center space-x-3 mb-3">
                          <Smartphone className="w-8 h-8 text-yellow-500" />
                          <div>
                            <h3 className="font-semibold">{servico.nome_aparelho}</h3>
                            <p className="text-sm text-gray-600">CPF: {formatCPF(servico.cliente_cpf)}</p>
                          </div>
                        </div>
                        <div className="service-details">
                          <p><strong>Serviço:</strong> {servico.tipo_servico}</p>
                          <p><strong>Valor:</strong> R$ {servico.valor_servico}</p>
                          {servico.tem_seguro && (
                            <Badge className="mt-2" variant="secondary">
                              <Shield className="w-3 h-3 mr-1" />
                              Com Seguro
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="promocoes" className="admin-content">
            <div className="admin-section">
              <div className="section-header">
                <h2>Gerenciar Promoções</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="add-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Promoção
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Promoção</DialogTitle>
                    </DialogHeader>
                    <div className="form-grid">
                      <div>
                        <Label htmlFor="titulo">Título</Label>
                        <Input
                          id="titulo"
                          value={promocaoForm.titulo}
                          onChange={(e) => setPromocaoForm({...promocaoForm, titulo: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="desconto">Desconto</Label>
                        <Input
                          id="desconto"
                          value={promocaoForm.desconto}
                          onChange={(e) => setPromocaoForm({...promocaoForm, desconto: e.target.value})}
                          placeholder="Ex: 20% ou R$ 50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="data_validade">Data de Validade</Label>
                        <Input
                          id="data_validade"
                          type="date"
                          value={promocaoForm.data_validade}
                          onChange={(e) => setPromocaoForm({...promocaoForm, data_validade: e.target.value})}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={promocaoForm.descricao}
                          onChange={(e) => setPromocaoForm({...promocaoForm, descricao: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={createPromocao}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="data-grid">
                {promocoes.map((promocao) => (
                  <Card key={promocao.id || promocao._id} className="promo-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Tag className="w-8 h-8 text-yellow-500" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{promocao.titulo}</h3>
                          <p className="text-sm text-gray-600">{promocao.descricao}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline">{promocao.desconto}</Badge>
                            <span className="text-sm text-gray-500">
                              Válida até: {new Date(promocao.data_validade).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="client-container">
      <div className="client-header">
        <div className="client-welcome">
          <Smartphone className="welcome-icon" />
          <div>
            <h1>Olá, {currentUser.nome}!</h1>
            <p>Snap Cell Store - Seus serviços e informações</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="logout-btn">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      <div className="client-content">
        <Tabs defaultValue="servicos" className="client-tabs">
          <TabsList className="client-tabs-list">
            <TabsTrigger value="servicos">Meus Serviços</TabsTrigger>
            <TabsTrigger value="promocoes">Promoções</TabsTrigger>
          </TabsList>

          <TabsContent value="servicos" className="services-content">
            {servicos.length === 0 ? (
              <Card className="empty-card">
                <CardContent className="text-center p-8">
                  <Smartphone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3>Nenhum serviço encontrado</h3>
                  <p className="text-gray-600">Quando você realizar um serviço, ele aparecerá aqui.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="services-grid">
                {servicos.map((servico) => (
                  <Card key={servico.id || servico._id} className="service-card">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-8 h-8 text-yellow-500" />
                        <div>
                          <CardTitle>{servico.nome_aparelho}</CardTitle>
                          <CardDescription>{servico.cor}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="service-details">
                        <div className="detail-row">
                          <span className="label">IMEI:</span>
                          <span className="value">{servico.imei}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Serviço:</span>
                          <span className="value">{servico.tipo_servico}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Data:</span>
                          <span className="value">{new Date(servico.data_servico).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Garantia até:</span>
                          <span className="value">{new Date(servico.data_fim_garantia).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Valor pago:</span>
                          <span className="value price">R$ {servico.valor_servico.toFixed(2)}</span>
                        </div>

                        <Separator className="my-4" />

                        {servico.tem_seguro ? (
                          <div className="insurance-info">
                            <div className="flex items-center space-x-2 mb-2">
                              <Shield className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-green-700">Seguro Ativo</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Valor do seguro:</span>
                              <span className="value price">R$ {servico.valor_seguro?.toFixed(2)}</span>
                            </div>
                            {servico.dias_seguro_restantes !== undefined && (
                              <div className="detail-row">
                                <span className="label">Dias restantes:</span>
                                <span className={`value ${servico.dias_seguro_restantes <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  {servico.dias_seguro_restantes} dias
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="no-insurance">
                            <span className="text-gray-600">Sem seguro</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="promocoes" className="promos-content">
            {promocoes.length === 0 ? (
              <Card className="empty-card">
                <CardContent className="text-center p-8">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3>Nenhuma promoção ativa</h3>
                  <p className="text-gray-600">Fique atento! Novas ofertas podem aparecer a qualquer momento.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="promos-grid">
                {promocoes.map((promocao) => (
                  <Card key={promocao.id || promocao._id} className="promo-card-client">
                    <CardContent className="p-6">
                      <div className="promo-content">
                        <div className="flex items-center space-x-3 mb-4">
                          <Tag className="w-8 h-8 text-yellow-500" />
                          <div>
                            <h3 className="font-bold text-xl">{promocao.titulo}</h3>
                            <Badge className="discount-badge">{promocao.desconto}</Badge>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">{promocao.descricao}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          Válida até: {new Date(promocao.data_validade).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;