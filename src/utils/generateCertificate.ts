import jsPDF from 'jspdf';

interface CertificateData {
  studentName: string;
  lessonTitle: string;
  completionDate: string;
  certificateNumber: string;
}

export const generateCertificatePDF = ({
  studentName,
  lessonTitle,
  completionDate,
  certificateNumber
}: CertificateData): string => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Configurações do certificado
  doc.setFont('helvetica', 'bold');
  
  // Dimensões da página
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  
  // Fundo azul escuro
  doc.setFillColor(13, 71, 161);
  doc.rect(0, 0, width, height, 'F');

  // Borda decorativa dourada
  doc.setDrawColor(212, 175, 55); // Dourado
  doc.setLineWidth(3);
  doc.rect(10, 10, width - 20, height - 20);
  
  // Borda interna
  doc.setLineWidth(0.5);
  doc.rect(15, 15, width - 30, height - 30);

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(40);
  doc.text('CERTIFICADO', width / 2, 50, { align: 'center' });

  // Subtítulo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Safety On Demand - Treinamentos em Segurança do Trabalho', width / 2, 65, { align: 'center' });

  // Texto principal
  doc.setFontSize(16);
  doc.text('Certificamos que', width / 2, 90, { align: 'center' });

  // Nome do aluno
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(studentName, width / 2, 105, { align: 'center' });

  // Descrição
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('concluiu com êxito o curso', width / 2, 125, { align: 'center' });

  // Nome do curso
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(lessonTitle, width / 2, 140, { align: 'center' });

  // Texto adicional
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'demonstrando conhecimento e competência em segurança do trabalho conforme as normas OSHA e regulamentações aplicáveis.',
    width / 2,
    160,
    { align: 'center', maxWidth: 200 }
  );

  // Data e número do certificado
  doc.setFontSize(12);
  doc.text(`Emitido em: ${completionDate}`, width / 2, 180, { align: 'center' });
  doc.text(`Certificado Nº: ${certificateNumber}`, width / 2, 188, { align: 'center' });

  // Assinaturas
  const signatureY = 200;
  
  // Linha de assinatura 1
  doc.setDrawColor(255, 255, 255);
  doc.line(width / 2 - 80, signatureY, width / 2 - 20, signatureY);
  doc.setFontSize(10);
  doc.text('Safety On Demand', width / 2 - 50, signatureY + 5, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Plataforma de Treinamento', width / 2 - 50, signatureY + 10, { align: 'center' });

  // Linha de assinatura 2
  doc.line(width / 2 + 20, signatureY, width / 2 + 80, signatureY);
  doc.setFontSize(10);
  doc.text('Instrutor Responsável', width / 2 + 50, signatureY + 5, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Certificado Digital', width / 2 + 50, signatureY + 10, { align: 'center' });

  // Retorna o PDF como base64
  return doc.output('dataurlstring');
}; 