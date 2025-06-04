
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Library as LibraryIcon, 
  Search,
  FileText,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DocumentUploadModal from '@/components/DocumentUploadModal';

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: "Normas OSHA de Construção",
      type: "PDF",
      size: "2.4 MB",
      category: "Regulamentações",
      description: "Normas completas de segurança em construção da OSHA"
    },
    {
      id: 2,
      title: "Diretrizes de Proteção contra Quedas",
      type: "PDF",
      size: "1.8 MB",
      category: "Procedimentos de Segurança",
      description: "Procedimentos abrangentes de proteção contra quedas e diretrizes de equipamentos"
    },
    {
      id: 3,
      title: "Fichas de Dados de Segurança Química",
      type: "PDF",
      size: "3.2 MB",
      category: "Segurança Química",
      description: "Fichas de dados de segurança para produtos químicos comuns no local de trabalho"
    }
  ]);

  const categories = ["Todas", "Regulamentações", "Procedimentos de Segurança", "Segurança Química", "Emergência", "Equipamentos", "Checklists"];
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const isAdmin = user && (user as any).user_metadata?.user_type === 'admin';

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDocumentUpload = (newDocument: any) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#071a3f', color: '#f2f2f2' }}>
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#f2f2f2' }}>Biblioteca</h1>
                <p className="text-sm text-gray-400">Documentação e recursos de segurança</p>
              </div>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Documento
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "border-gray-600 text-gray-300 hover:bg-gray-700"
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span style={{ color: '#f2f2f2' }} className="text-sm">{doc.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400 text-sm">{doc.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                      {doc.category}
                    </span>
                    <span className="text-gray-400">{doc.size}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                      <Download className="w-4 h-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <LibraryIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum documento encontrado</h3>
              <p className="text-gray-500">Tente ajustar os critérios de busca</p>
            </div>
          )}
        </div>
      </main>

      {isAdmin && (
        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleDocumentUpload}
        />
      )}
    </div>
  );
};

export default Library;
