import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateCertificatePDF } from "@/utils/generateCertificate";

interface CertificateGeneratorProps {
  courseId: string;
  courseName: string;
  onCertificateGenerated?: () => void;
}

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

const CertificateGenerator = ({ courseId, courseName, onCertificateGenerated }: CertificateGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  const generateCertificate = async () => {
    if (!user) return;

    try {
      // Verificar se o certificado já existe
      const { data: existingCert } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (existingCert) {
        toast({
          title: "Certificado já existe",
          description: "Você já possui um certificado para este curso.",
        });
        return;
      }

      // Buscar nome completo do usuário
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.full_name) {
        throw new Error('Não foi possível encontrar os dados do usuário');
      }

      // Gerar número do certificado
      const timestamp = new Date().getTime();
      const certificateNumber = `CERT-${timestamp}-${user.id.slice(-4)}`;

      // Gerar PDF do certificado
      const pdfData = generateCertificatePDF({
        studentName: userData.full_name,
        lessonTitle: courseName,
        completionDate: new Date().toLocaleDateString('pt-BR'),
        certificateNumber
      });

      if (!pdfData) {
        throw new Error('Erro ao gerar o PDF do certificado');
      }

      // Salvar no banco de dados
      const { error } = await supabase
        .from('certificates')
        .insert({
          certificate_number: certificateNumber,
          user_id: user.id,
          course_id: courseId,
          issued_date: new Date().toISOString()
        });

      if (error) throw error;

      // Atualizar URL do certificado no estado
      setCertificateUrl(pdfData);

      toast({
        title: "Certificado gerado! 🎉",
        description: "Seu certificado foi criado com sucesso. Você ganhou 50 pontos!",
      });

      if (onCertificateGenerated) {
        onCertificateGenerated();
      }

    } catch (error) {
      const supabaseError = error as SupabaseError;
      console.error('Error generating certificate:', supabaseError);
      toast({
        title: "Erro",
        description: "Erro ao gerar certificado: " + supabaseError.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={generateCertificate}
        className="bg-yellow-600 hover:bg-yellow-700 text-white"
      >
        <Award className="w-4 h-4 mr-2" />
        Gerar Certificado
      </Button>

      {certificateUrl && (
        <div className="mt-4">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <iframe 
              src={certificateUrl}
              className="w-full h-[600px] border-0"
              title="Certificado"
            />
          </div>
          <Button
            onClick={() => window.open(certificateUrl, '_blank')}
            variant="outline"
            className="mt-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Certificado
          </Button>
        </div>
      )}
    </div>
  );
};

export default CertificateGenerator;
